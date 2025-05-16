import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  meetings: [],
  loading: false,
  error: null,
};

const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    // Create new meeting
    createMeetingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createMeetingSuccess: (state, action) => {
      state.loading = false;
      state.meetings.push(action.payload);
    },
    createMeetingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get all meetings
    getMeetingsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getMeetingsSuccess: (state, action) => {
      state.loading = false;
      state.meetings = action.payload;
    },
    getMeetingsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update meeting
    updateMeetingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateMeetingSuccess: (state, action) => {
      state.loading = false;
      const index = state.meetings.findIndex(meeting => meeting.id === action.payload.id);
      if (index !== -1) {
        state.meetings[index] = action.payload;
      }
    },
    updateMeetingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete meeting
    deleteMeetingStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteMeetingSuccess: (state, action) => {
      state.loading = false;
      state.meetings = state.meetings.filter(meeting => meeting.id !== action.payload);
    },
    deleteMeetingFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update attendance
    updateAttendanceStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateAttendanceSuccess: (state, action) => {
      state.loading = false;
      const { meetingId, studentId, timeIn, timeOut, status } = action.payload;
      const meeting = state.meetings.find(m => m.id === meetingId);
      if (meeting) {
        const student = meeting.attendanceList.find(a => a.id === studentId);
        if (student) {
          student.timeIn = timeIn;
          student.timeOut = timeOut;
          student.status = status;
        }
      }
    },
    updateAttendanceFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createMeetingStart,
  createMeetingSuccess,
  createMeetingFailure,
  getMeetingsStart,
  getMeetingsSuccess,
  getMeetingsFailure,
  updateMeetingStart,
  updateMeetingSuccess,
  updateMeetingFailure,
  deleteMeetingStart,
  deleteMeetingSuccess,
  deleteMeetingFailure,
  updateAttendanceStart,
  updateAttendanceSuccess,
  updateAttendanceFailure,
} = meetingSlice.actions;

export default meetingSlice.reducer; 