$(document).ready(function () {
    let taskId = 0;
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));

    // Load tasks from local storage
    function loadTasks() {
        const todoTasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        const doneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];

        todoTasks.forEach(task => {
            addTaskToColumn(task, '#todoTasks');
        });

        doneTasks.forEach(task => {
            addTaskToColumn(task, '#doneTasks');
        });

        taskId = Math.max(...todoTasks.map(task => task.id), ...doneTasks.map(task => task.id)) + 1;
    }

    function addTaskToColumn(task, columnId) {
        const taskElement = $('<div>').addClass('task').attr('id', 'task-' + task.id);
        taskElement.append($('<h5>').text(task.name));
        taskElement.append($('<p>').text(task.description));
        taskElement.append($('<p>').text('Deadline: ' + task.deadline));
        taskElement.append($('<button>').addClass('btn btn-danger delete-task').text('Delete'));

        // Color code task based on due date
        const today = new Date();
        const dueDate = new Date(task.deadline);
        if (dueDate < today) {
            taskElement.addClass('task-due-passed');
        } else if ((dueDate - today) / (1000 * 3600 * 24) <= 2) { // Within 2 days
            taskElement.addClass('task-due-near');
        }

        $(columnId).append(taskElement);
    }

    loadTasks();

    $('#taskForm').submit(function (e) {
        e.preventDefault();
        const taskName = $('#taskName').val();
        const taskDescription = $('#taskDescription').val();
        const taskDeadline = $('#taskDeadline').val();

        const task = {
            id: taskId,
            name: taskName,
            description: taskDescription,
            deadline: taskDeadline
        };

        addTaskToColumn(task, '#todoTasks');

        // Save tasks to local storage
        const todoTasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        todoTasks.push(task);
        localStorage.setItem('todoTasks', JSON.stringify(todoTasks));

        taskId++;
        taskModal.hide();
        $('#taskForm')[0].reset();
    });

    // Make task columns sortable
    $('.task-column').sortable({
        connectWith: '.task-column',
        placeholder: 'task-placeholder',
        update: function (event, ui) {
            const task = {
                id: parseInt(ui.item.attr('id').split('-')[1]),
                name: ui.item.find('h5').text(),
                description: ui.item.find('p:eq(0)').text(),
                deadline: ui.item.find('p:eq(1)').text().replace('Deadline: ', '')
            };

            // Determine the target column
            const targetColumn = ui.item.parent().attr('id');

            // Remove task from local storage
            let todoTasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
            let doneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];
            todoTasks = todoTasks.filter(t => t.id !== task.id);
            doneTasks = doneTasks.filter(t => t.id !== task.id);

            // Add task to the new column
            if (targetColumn === 'todoTasks') {
                todoTasks.push(task);
            } else if (targetColumn === 'doneTasks') {
                doneTasks.push(task);
            }

            localStorage.setItem('todoTasks', JSON.stringify(todoTasks));
            localStorage.setItem('doneTasks', JSON.stringify(doneTasks));
        }
    });

    $('.task-column').on('click', '.delete-task', function () {
        $(this).closest('.task').remove();
        const taskId = $(this).parent().attr('id').split('-')[1];
        // Remove task from local storage
        let todoTasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        let doneTasks = JSON.parse(localStorage.getItem('doneTasks')) || [];
        todoTasks = todoTasks.filter(task => task.id !== parseInt(taskId));
        doneTasks = doneTasks.filter(task => task.id !== parseInt(taskId));
        localStorage.setItem('todoTasks', JSON.stringify(todoTasks));
        localStorage.setItem('doneTasks', JSON.stringify(doneTasks));
    });
});
