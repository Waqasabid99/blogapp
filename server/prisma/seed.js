import { prisma } from "../src/lib/prisma.js"

async function main() {

  console.log("Starting RBAC seed...")

  //////////////////////////////////////////////////////
  // PERMISSIONS
  //////////////////////////////////////////////////////

  const permissions = [

    //////////////////////////////////////////////////////
    // DASHBOARD
    //////////////////////////////////////////////////////

    { action: "dashboard.view", description: "View admin dashboard" },

    //////////////////////////////////////////////////////
    // POSTS
    //////////////////////////////////////////////////////

    { action: "post.create", description: "Create posts" },
    { action: "post.update", description: "Update any post" },
    { action: "post.delete", description: "Delete posts" },
    { action: "post.publish", description: "Publish posts" },
    { action: "post.schedule", description: "Schedule posts" },
    { action: "post.archive", description: "Archive posts" },
    { action: "post.feature", description: "Feature posts" },
    { action: "post.pin", description: "Pin posts" },

    //////////////////////////////////////////////////////
    // POST WORKFLOW
    //////////////////////////////////////////////////////

    { action: "post.submit_for_review", description: "Submit post for review" },
    { action: "post.approve", description: "Approve posts" },
    { action: "post.reject", description: "Reject posts" },

    //////////////////////////////////////////////////////
    // POST MANAGEMENT
    //////////////////////////////////////////////////////

    { action: "post.lock", description: "Lock posts for editing" },
    { action: "post.unlock", description: "Unlock posts" },
    { action: "post.view_drafts", description: "View draft posts" },

    //////////////////////////////////////////////////////
    // POST REVISIONS
    //////////////////////////////////////////////////////

    { action: "post_revision.view", description: "View post revisions" },
    { action: "post_revision.restore", description: "Restore revision" },

    //////////////////////////////////////////////////////
    // CATEGORIES
    //////////////////////////////////////////////////////

    { action: "category.create", description: "Create categories" },
    { action: "category.update", description: "Update categories" },
    { action: "category.delete", description: "Delete categories" },

    //////////////////////////////////////////////////////
    // TAGS
    //////////////////////////////////////////////////////

    { action: "tag.create", description: "Create tags" },
    { action: "tag.update", description: "Update tags" },
    { action: "tag.delete", description: "Delete tags" },

    //////////////////////////////////////////////////////
    // MEDIA LIBRARY
    //////////////////////////////////////////////////////

    { action: "media.upload", description: "Upload media" },
    { action: "media.update", description: "Update media metadata" },
    { action: "media.delete", description: "Delete media" },
    { action: "media.view", description: "View media library" },

    //////////////////////////////////////////////////////
    // COMMENTS
    //////////////////////////////////////////////////////

    { action: "comment.create", description: "Create comments" },
    { action: "comment.update", description: "Edit comments" },
    { action: "comment.delete", description: "Delete comments" },
    { action: "comment.moderate", description: "Moderate comments" },
    { action: "comment.approve", description: "Approve comments" },
    { action: "comment.reject", description: "Reject comments" },
    { action: "comment.spam", description: "Mark comments as spam" },

    //////////////////////////////////////////////////////
    // USERS
    //////////////////////////////////////////////////////

    { action: "user.view", description: "View users" },
    { action: "user.create", description: "Create users" },
    { action: "user.update", description: "Update users" },
    { action: "user.delete", description: "Delete users" },

    //////////////////////////////////////////////////////
    // ROLES & PERMISSIONS
    //////////////////////////////////////////////////////

    { action: "role.view", description: "View roles" },
    { action: "role.create", description: "Create roles" },
    { action: "role.update", description: "Update roles" },
    { action: "role.delete", description: "Delete roles" },

    { action: "permission.view", description: "View permissions" },
    { action: "permission.assign", description: "Assign permissions to roles" },

    //////////////////////////////////////////////////////
    // SERIES
    //////////////////////////////////////////////////////

    { action: "series.view", description: "View series" },
    { action: "series.create", description: "Create series" },
    { action: "series.update", description: "Update series" },
    { action: "series.delete", description: "Delete series" },

    //////////////////////////////////////////////////////
    // ANALYTICS
    //////////////////////////////////////////////////////

    { action: "analytics.view", description: "View analytics" },

    //////////////////////////////////////////////////////
    // NEWSLETTER
    //////////////////////////////////////////////////////

    { action: "newsletter.create_campaign", description: "Create newsletter campaign" },
    { action: "newsletter.send_campaign", description: "Send newsletter campaign" },
    { action: "newsletter.view_subscribers", description: "View subscribers" },
    { action: "newsletter.delete_subscriber", description: "Delete subscribers" }

  ]

  const permissionMap = {}

  for (const permission of permissions) {

    const record = await prisma.permission.upsert({
      where: { action: permission.action },
      update: {},
      create: permission
    })

    permissionMap[permission.action] = record
  }

  console.log("Permissions seeded")

  //////////////////////////////////////////////////////
  // ROLES
  //////////////////////////////////////////////////////

  const roles = [

    { name: "Admin", slug: "admin" },
    { name: "Editor", slug: "editor" },
    { name: "Writer", slug: "writer" },
    { name: "Guest Writer", slug: "guest_writer" },
    { name: "User", slug: "user" }

  ]

  const roleMap = {}

  for (const role of roles) {

    const record = await prisma.role.upsert({
      where: { slug: role.slug },
      update: {},
      create: role
    })

    roleMap[role.slug] = record
  }

  console.log("Roles seeded")

  //////////////////////////////////////////////////////
  // ROLE PERMISSIONS
  //////////////////////////////////////////////////////

  const rolePermissions = {

    //////////////////////////////////////////////////////
    // ADMIN
    //////////////////////////////////////////////////////

    admin: permissions.map(p => p.action),

    //////////////////////////////////////////////////////
    // EDITOR
    //////////////////////////////////////////////////////

    editor: [

      "dashboard.view",

      "post.create",
      "post.update",
      "post.delete",
      "post.publish",
      "post.schedule",
      "post.feature",
      "post.pin",
      "post.approve",
      "post.reject",
      "post.view_drafts",

      "post_revision.view",
      "post_revision.restore",

      "category.create",
      "category.update",
      "category.delete",

      "tag.create",
      "tag.update",
      "tag.delete",

      "media.upload",
      "media.update",
      "media.delete",
      "media.view",

      "comment.moderate",
      "comment.approve",
      "comment.reject",
      "comment.spam",

      "series.view",
      "series.create",
      "series.update",
      "series.delete",

      "analytics.view"
    ],

    //////////////////////////////////////////////////////
    // WRITER
    //////////////////////////////////////////////////////

    writer: [

      "dashboard.view",

      "post.create",
      "post.update",
      "post.delete",
      "post.submit_for_review",

      "media.upload",
      "media.view",

      "series.view",
      "series.create",
      "series.update",
      "series.delete",
    ],

    //////////////////////////////////////////////////////
    // GUEST WRITER
    //////////////////////////////////////////////////////

    guest_writer: [

      "post.create",
      "post.submit_for_review",

      "media.upload",
      "media.view",

      "series.view",
      "series.create",
      "series.update",
      "series.delete",
    ],

    //////////////////////////////////////////////////////
    // USER
    //////////////////////////////////////////////////////

    user: [

      "comment.create"
    ]

  }

  for (const roleSlug of Object.keys(rolePermissions)) {

    const role = roleMap[roleSlug]

    for (const action of rolePermissions[roleSlug]) {

      const permission = permissionMap[action]

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

      })

    }

  }

  console.log("Role permissions mapped")

  console.log("RBAC seed completed successfully")

}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })