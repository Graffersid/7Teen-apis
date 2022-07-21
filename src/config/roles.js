const allRoles = {
  user: ['upload-pic'],
  admin: ['getUsers', 'manageUsers'],
  parent: ['approveUser','getChilds','parent-register','parent-login'],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
