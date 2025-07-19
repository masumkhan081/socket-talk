// abc
const rooms = ["frontend", "backend"];


const data = {
      locals: {
            title: 'Study On Socket ',
      },
      users: [
            {
                  id: 1,
                  uname: "chayan",
                  password: "100",
                  groupId: 1,
                  groupName: "frontend"
            },
            {
                  id: 2,
                  uname: "masum",
                  password: "101",
                  groupId: 2,
                  groupName: "backend"
            },
            {
                  id: 3,
                  uname: "safayet",
                  password: "102",
                  groupId: 2,
                  groupName: "backend"
            },
            {
                  id: 4,
                  uname: "miskat",
                  password: "103", groupId: 1,
                  groupName: "frontend"
            },
            {
                  id: 5,
                  uname: "shuvo",
                  password: "104", groupId: 1,
                  groupName: "frontend"
            },

      ]
}

module.exports = { data, rooms };