import { prisma } from "../src/lib/prisma.js"

async function main() {

  console.log("Starting database seed...");

  ////////////////////////////////////////////////////////
  // PERMISSIONS
  ////////////////////////////////////////////////////////

  const permissions = [
    { action: "create_post", description: "Create blog posts" },
    { action: "update_post", description: "Update blog posts" },
    { action: "delete_post", description: "Delete blog posts" },
    { action: "publish_post", description: "Publish posts" },
    { action: "approve_post", description: "Approve submitted posts" },
    { action: "reject_post", description: "Reject submitted posts" },

    { action: "manage_categories", description: "Create/update/delete categories" },
    { action: "manage_tags", description: "Create/update/delete tags" },

    { action: "manage_users", description: "Create/update/delete users" },
    { action: "manage_roles", description: "Manage roles and permissions" },

    { action: "manage_comments", description: "Moderate comments" },

    { action: "view_admin_dashboard", description: "Access admin dashboard" }
  ];

  const createdPermissions = {};

  for (const permission of permissions) {
    const record = await prisma.permission.upsert({
      where: { action: permission.action },
      update: {},
      create: permission
    });

    createdPermissions[permission.action] = record;
  }

  console.log("Permissions seeded");

  ////////////////////////////////////////////////////////
  // ROLES
  ////////////////////////////////////////////////////////

  const roles = [
    { name: "Admin", slug: "admin" },
    { name: "Editor", slug: "editor" },
    { name: "Writer", slug: "writer" },
    { name: "Guest Poster", slug: "guest_poster" },
    { name: "User", slug: "user" }
  ];

  const createdRoles = {};

  for (const role of roles) {
    const record = await prisma.role.upsert({
      where: { slug: role.slug },
      update: {},
      create: role
    });

    createdRoles[role.slug] = record;
  }

  console.log("Roles seeded");

  ////////////////////////////////////////////////////////
  // ROLE → PERMISSION MAPPING
  ////////////////////////////////////////////////////////

  const rolePermissions = {

    admin: [
      "create_post",
      "update_post",
      "delete_post",
      "publish_post",
      "approve_post",
      "reject_post",
      "manage_categories",
      "manage_tags",
      "manage_users",
      "manage_roles",
      "manage_comments",
      "view_admin_dashboard"
    ],

    editor: [
      "create_post",
      "update_post",
      "delete_post",
      "publish_post",
      "approve_post",
      "reject_post",
      "manage_categories",
      "manage_tags",
      "manage_comments",
      "view_admin_dashboard"
    ],

    writer: [
      "create_post",
      "update_post",
      "delete_post",
      "view_admin_dashboard"
    ],

    guest_poster: [
      "create_post"
    ],

    user: []
  };

  for (const roleSlug of Object.keys(rolePermissions)) {

    const role = createdRoles[roleSlug];

    for (const action of rolePermissions[roleSlug]) {

      const permission = createdPermissions[action];

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id
          }
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id
        }
      });

    }
  }

  console.log("Role permissions mapped");

  console.log("Database seeding completed successfully");
}

main()
  .catch((error) => {
    console.error("Seeding error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });