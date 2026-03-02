# Self Tracker – Software Engineer

A general-purpose self-tracker web application for software engineers, built with **AngularJS v1**.

## Features

- **Role-based login** – switch between Manager and Employee views without a backend
- **Dashboard** – stats overview (tasks, goals, avg skill level); managers see aggregated team data
- **My Tasks** – filterable task list with inline add/edit/delete; categorised as feature/bug/learning/documentation
- **My Skills** – proficiency tracking (1–5 scale) with visual dot indicators and target levels
- **My Goals** – progress tracking with live sliders; categorised as technical/soft-skill/career/personal
- **Team Overview** *(manager only)* – searchable employee table with per-person quick stats; drill-in to see a full employee detail
- **Import / Export** – every data section supports exporting the current list to a JSON file and importing a JSON file to merge records

## Dummy Data

Pre-loaded JSON files live in `/data/`. They are served as static files and loaded by `$http.get` – no backend needed.

| File | Records |
|---|---|
| `data/employees.json` | 1 manager + 4 engineers |
| `data/tasks.json` | 12 tasks across all employees |
| `data/skills.json` | 12 skill entries |
| `data/goals.json` | 10 goals |

## Getting Started

```bash
npm install
npm start
# Open http://localhost:8080
```

The app is served by [http-server](https://github.com/http-party/http-server). All data is loaded from the local `/data/*.json` files via `$http`.

## Project Structure

```
├── index.html                  # Entry point (ng-app, sidebar shell)
├── package.json
├── data/                       # Static JSON data files
│   ├── employees.json
│   ├── tasks.json
│   ├── skills.json
│   └── goals.json
├── css/
│   └── style.css               # All styles (sidebar layout, cards, badges)
└── app/
    ├── app.js                  # Module + route config
    ├── services/
    │   ├── DataService.js      # $http wrappers for /data/*.json
    │   └── FileService.js      # Blob export + FileReader import
    ├── controllers/
    │   ├── LoginController.js
    │   ├── MainController.js   # Sidebar shell, auth guard
    │   ├── DashboardController.js
    │   ├── TaskController.js
    │   ├── SkillController.js
    │   ├── GoalController.js
    │   └── EmployeeController.js
    └── views/
        ├── login.html
        ├── dashboard.html
        ├── tasks.html
        ├── skills.html
        ├── goals.html
        ├── employees.html
        └── employee-detail.html
```

## Manager / Employee Relations

Each employee record in `employees.json` carries a `managerId` field (null for managers). The AngularJS controllers use this to:

- Show the **Team Overview** menu item only to managers
- Let a manager drill into any employee's tasks, skills, and goals (read-only)
- Aggregate team-level statistics on the manager dashboard
