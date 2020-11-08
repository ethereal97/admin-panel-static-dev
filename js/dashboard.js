const FAKER_API = 'VT4F-ISFE-L29J-6O3H';
const FAKER_USER_URL = 'https://randomuser.me/api/?key=' + FAKER_API;

const app = new Vue({
    el: "#root",
    data() {
        return {
            sidebarOpen: false,
            notificationOpen: false,
            dropdownOpen: false,
            user: {
                name: {
                    title: null,
                    first: null,
                    last: null,
                },
                picture: {
                    thumbnail: null,
                }
            },
            employees: [],
            isNewUser: false,
            providerId: null,
            notification: [],
        };
    },
    methods: {
        toggleSidebar() {
            this.sidebarOpen = !this.sidebarOpen;
        },
        toggleNotification() {
            this.notificationOpen = !this.notificationOpen;
        },
        toggleDropdown() {
            this.dropdownOpen = !this.dropdownOpen;
        },
        deleteAccount() {
            if (confirm('Are you sure that you want to delete this account? This cannot be undone!')) {
                sessionStorage.clear();
                location.assign('/?deleted');
            }
        },
        signOut() {
            sessionStorage.clear();
            location.assign('/?logout');
        }
    }
});

/*
let flash_notification = sessionStorage.getItem('__flash_notification_message');

if (flash_notification) {
    flash_notification = JSON.parse(flash_notification);
    app.providerId = flash_notification.providerId;
    app.isNewUser = flash_notification.isNewUser;
    app.notification.push('');
    sessionStorage.removeItem('__flash_notification_message');
}*/

let user = sessionStorage.getItem(btoa('user'));

if (user) {
    user = JSON.parse(user);
    app.user = user;
} else {
    fetch(FAKER_USER_URL)
        .then(result => result.json())
        .then(result => {
            user = result.results[0];
            sessionStorage.setItem(btoa('user'), JSON.stringify(user));
            app.user = user;
        });
}

let employees = sessionStorage.getItem(btoa('employees'));

if (employees) {
    employees = JSON.parse(employees);
    console.log(employees);
    app.employees = employees;
} else {
    getRandomEmployees().then(staffs => sessionStorage.setItem(btoa('employees'), staffs));
}

async function getRandomEmployees() {
    //* random employees RANGE[8-13]
    let staffs = Math.floor(Math.random() * 8) + 5;
    let employees = [];
    for (let i = 0; i < staffs; i++) {
        await fetch(FAKER_USER_URL)
            .then(res => res.json())
            .then(res => {
                let employee = res.results[0];
                employees.push(employee);
            });
    }
    staffs = JSON.stringify(employees);
    app.employees = employees;
    return staffs;
}
