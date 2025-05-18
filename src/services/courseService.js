import api from './api';

const courseService = {
  // Mengambil daftar kelas yang diambil mahasiswa
  getEnrolledClasses: async (semester, academicYear) => {
    try {
      console.log('Fetching enrolled classes with params:', { semester, academicYear });
      const response = await api.get('/student/enrolled-courses', {  // Mengubah endpoint
        params: {
          semester,
          academic_year: academicYear
        }
      });
      console.log('Enrolled classes response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getEnrolledClasses:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Mengambil detail kelas
  getClassDetails: async (classId) => {
    try {
      console.log('Fetching class details for ID:', classId);
      const response = await api.get(`/student/course-details/${classId}`);  // Mengubah endpoint
      console.log('Class details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getClassDetails:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Mengambil data kehadiran mahasiswa untuk kelas tertentu
  getAttendance: async (classId) => {
    try {
      console.log('Fetching attendance for class ID:', classId);
      const response = await api.get(`/student/course-attendance/${classId}`);  // Mengubah endpoint
      console.log('Attendance response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAttendance:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  },

  // Mengambil semua data mata kuliah dan kehadiran sekaligus
  getAllCourseData: async (semester, academicYear) => {
    try {
      console.log('Starting getAllCourseData with:', { semester, academicYear });
      
      // 1. Ambil daftar kelas yang diambil
      const enrolledResponse = await courseService.getEnrolledClasses(semester, academicYear);
      const enrolledClasses = enrolledResponse.data || [];
      console.log('Enrolled classes:', enrolledClasses);

      if (!enrolledClasses || enrolledClasses.length === 0) {
        console.log('No enrolled classes found');
        return [];
      }

      // 2. Ambil detail untuk setiap kelas
      const coursesData = await Promise.all(
        enrolledClasses.map(async (enrollment) => {
          try {
            console.log('Processing enrollment:', enrollment);
            const [classDetails, attendanceData] = await Promise.all([
              courseService.getClassDetails(enrollment.id),
              courseService.getAttendance(enrollment.id)
            ]);

            if (!classDetails?.data) {
              console.error('Invalid class details response:', classDetails);
              return null;
            }

            const courseData = {
              id: enrollment.id,
              course: classDetails.data.course || {},
              lecturer: classDetails.data.lecturer || {},
              class: classDetails.data || {},
              schedule: classDetails.data.schedule || '-',
              room: classDetails.data.room || '-',
              attendance_rate: attendanceData?.data?.attendance_rate || 0
            };
            console.log('Processed course data:', courseData);
            return courseData;
          } catch (err) {
            console.error('Error processing enrollment:', {
              enrollment,
              error: err.message,
              response: err.response?.data
            });
            return null;
          }
        })
      );

      // 3. Filter out any null values
      const filteredData = coursesData.filter(course => course !== null);
      console.log('Final filtered data:', filteredData);
      return filteredData;
    } catch (error) {
      console.error('Error in getAllCourseData:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }
};

export default courseService; 