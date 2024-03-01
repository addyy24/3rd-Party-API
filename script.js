$(document).ready(function () {
    let taskId = 0;
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
  
    function loadTasks() {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.forEach(task => {
        addTaskToColumn(task, '#' + task.status + 'Tasks');
      });
      if (tasks.length > 0) {
        taskId = Math.max(...tasks.map(task => task.id)) + 1;
      }
    }
  
    function addTaskToColumn(task, columnId) {
      const taskElement = $('<div>').addClass('task').attr('id', 'task-' + task.id);
      taskElement.append($('<h5>').text(task.name));
      taskElement.append($('<p>').text(task.description));
      taskElement.append($('<p>').text('Deadline: ' + task.deadline));
      const deleteButton = $('<button>').addClass('btn btn-danger delete-task').text('Delete');
      taskElement.append(deleteButton);
  
      // Check and apply color coding based on due date
      colorCodeTask(taskElement, task.deadline);
  
      $(columnId).append(taskElement);
  
      deleteButton.click(function() {
        const parentTaskId = $(this).parent().attr('id').split('-')[1];
        removeTaskFromLocalStorage(parseInt(parentTaskId));
        $(this).parent().remove();
      });
    }
  
    function removeTaskFromLocalStorage(taskId) {
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks = tasks.filter(task => task.id !== taskId);
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  
    function saveNewTask(task) {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.push(task);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      addTaskToColumn(task, '#todoTasks');
    }
  
    loadTasks();
  
    $('#taskForm').submit(function (e) {
      e.preventDefault();
      const taskName = $('#taskName').val();
      const taskDescription = $('#taskDescription').val();
      const taskDeadline = $('#taskDeadline').val();
  
      const task = {
        id: taskId++,
        name: taskName,
        description: taskDescription,
        deadline: taskDeadline,
        status: 'todo'
      };
  
      saveNewTask(task);
      taskModal.hide();
      $('#taskForm')[0].reset();
    });
  
    $('.task-column').sortable({
      connectWith: '.task-column',
      placeholder: 'task-placeholder',
      stop: function(event, ui) {
        updateTaskStatusInLocalStorage(ui.item);
      }
    }).disableSelection();
  
    function updateTaskStatusInLocalStorage(taskElement) {
      let taskId = parseInt(taskElement.attr('id').split('-')[1]);
      let newStatus = taskElement.closest('.task-column').attr('id').replace('Tasks', '');
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      let task = tasks.find(task => task.id === taskId);
      if (task) {
        task.status = newStatus;
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }
    }
  
    // Function to color code the task based on its deadline
    function colorCodeTask(taskElement, deadline) {
      const today = new Date();
      const dueDate = new Date(deadline);
      if (dueDate < today) {
        taskElement.addClass('task-due-passed');
      } else if ((dueDate - today) / (1000 * 3600 * 24) <= 2) {
        taskElement.addClass('task-due-near');
      }
    }
  });
  