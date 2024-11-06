import axios from "axios";

const Project_BASE_URL = "http://localhost:8000/project/projects/";
const BASEURL = "http://127.0.0.1:8000/";


export const fetchDataBySelection = async (selection, Id, status ,timingFilter) => {

  try {
    let responseData; 

    switch (selection) {
      case 'LeaveReqs':
        responseData = await axios.get(`${BASEURL}LeaveManagement/all_leave_requests/`);
        break;
      case 'LeaveRequsByUser':
        responseData = await axios.get(`${BASEURL}LeaveManagement/get_leave_requests_by_user/?userId=${Id}`);
        break;
      case 'projects':
        responseData = await axios.get(`${Project_BASE_URL}?timingFilter=${timingFilter}`);
        break;
      case 'projectswithoutcompelete':
        responseData = await axios.get(`http://localhost:8000/project/projects-exclude-complete/`);
        break;
      case 'allEmployees':
        if(!timingFilter){
          responseData = await axios.get(`${BASEURL}authapp/Users/`);
        }else{
        responseData = await axios.get(`${BASEURL}authapp/Users/?timingFilter=${timingFilter}`);
        }
        break;
      case 'helpdeskQueries':
        responseData = await axios.get(`${BASEURL}helpdesk/get_queries/?timingFilter=${timingFilter}`);
        break;
      case 'tasks':
        responseData = await axios.get(`${BASEURL}task/tasks/?timing_filter=${timingFilter}`);
        break;
      case 'tasksByEmployee':
        if (!Id) {
          throw new Error('Employee ID required for tasksByEmployee selection.');
        } 
        responseData = await axios.get(
          `${BASEURL}task/tasks-by-user/?userId=${Id}&timing_filter=${timingFilter}`
        );
        break;
      case 'get_tasks_by_Completion_status':
        responseData = await axios.get(`${BASEURL}task/get_tasks_by_Completion_status/`);
        break;
       case 'taskswithoutstatusComplete':
        responseData = await axios.get(`${BASEURL}task/get_tasks_status_notcomplete/`);
        break;
        case 'tasksByProject':
          if(!Id) {
            throw new Error('Project ID required Taskbyproject Data.');
          }
          responseData = await axios.get(
            `${BASEURL}task/tasks-by-project/?projectId=${Id}`
          );
          break;
        case 'taskHistory':
          responseData = await axios.get(`${BASEURL}task/taskhistory/`);
          break;
        case 'taskAction_history':
          responseData = await axios.get(`${BASEURL}task/action_history_by_task/?taskId=${Id}`);
          break;
        case 'taskCompleteRequests':
          responseData = await axios.get(`${BASEURL}task/get_all_task_Status/`);
          break;
        case 'taskCompleteRequestsforuser':
          responseData = await axios.get(`${BASEURL}task/task-status-requests/?userId=${Id}`);
          break;
        case 'Appointments':
          if (status){
            responseData = await axios.get(`${BASEURL}appointment/get-Appointments/?status=${status}`);
          }else{
            responseData = await axios.get(`${BASEURL}appointment/AppointmentforAdmin/?timingFilter=${timingFilter}`);
          }
          break;
        case 'Appointmentsbycreator':
          responseData = await axios.get(`${BASEURL}appointment/get_appointments_by_creator/${Id}/?timingFilter=${timingFilter}`);
          break;
      default:
        throw new Error(`Invalid selection: ${selection}`);
    }
    return responseData.data; 
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch data. Please try again.');
  }
};


export const updateDataBySelection = async (selection, id, data) => {
  try {
   let responseData;
    switch (selection) {
      case 'project':
        responseData = await axios.put(`${Project_BASE_URL}${id}/`, data);
        break;
      case 'task':
        responseData = await axios.put(`${BASEURL}task/tasks/${id}/`, data);
        break;
      case 'employee':
        responseData = await axios.put(`${BASEURL}authapp/Users/${id}/`, data);
        break;
      case 'helpdeskQuery':
        responseData = await axios.put(`${BASEURL}helpdesk/queries/${id}/`, data);
        break;
      case 'appointments':
        responseData = await axios.put(`${BASEURL}appointment/appointments/${id}/`,data);
        break;
      default:
        throw new Error(`Invalid selection: ${selection}`);
    }
    return responseData.data;
  } catch (error) {
    if (selection === 'task' || selection === 'employee' || selection === 'helpdeskQuery') {
      throw error; 
    } 
  }
};

export const addDataBySelection = async (selection, values) => {
  try {
    let responseData;
    switch (selection) {
      case 'helpdeskQuery':
        responseData = await axios.post(`${BASEURL}helpdesk/queries/`, values);
        break;
      case 'employee':
        responseData = await axios.post(`${BASEURL}authapp/Users/`, values);
        break;
      case 'task':
        responseData = await axios.post(`${BASEURL}task/tasks/`, values);
        break;
      case 'project':
        responseData = await axios.post(`${Project_BASE_URL}`, values);
        break;
      case 'TaskActivity':
        responseData = await axios.post(`${BASEURL}task/taskhistory/`, values);
        break;
      case 'appointments':
        responseData = await axios.post(`${BASEURL}appointment/appointments/`,values);
        break;
      default:
        throw new Error(`Invalid selection: ${selection}`);
    }
    return responseData.data;
  } catch (error) {

    throw error; 
  }
};

export const PutStarted = async () => {
  try {
    await axios.get(`${Project_BASE_URL}fetch-null-status/`);
  } catch (error) {
    throw new Error("Failed to upadte Status. Please try again.");
  }
};


export const Request_finished = async (value) =>{
   try{
    await axios.post(`${BASEURL}approve-request/`,value);
  } catch (error) {
    throw new Error("Failed to Request");
  }
}

export const Approve_Task = async (id) => {
  try{
    await axios.get(`${BASEURL}task/approve-request/${id}/`);
  } catch (error) {
    throw new Error("Failed to Approve Request");
  }
} 
export const Reject_Task = async (id) => {
  try{
    await axios.get(`${BASEURL}task/reject-request/${id}/`)
  } catch (error) {
    throw new Error("Failed to Reject Request");
  }
} 

export const accept_appointment_request = async (id) => {
  await axios.get(`${BASEURL}appointment/accept/${id}/`);
}

export const reject_appointment_request = async (id) => {
  await axios.get(`${BASEURL}appointment/reject/${id}/`);
}