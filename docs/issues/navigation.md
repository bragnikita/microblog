
Public pages
/content/{slug} - fetch a post by slug and display it (support only microposts for now)
/albums - fotoalbums (under construction) 
/categories - list of public categories (under construction)
/microblog - microblog thread
/login


Admin pages (required to be logged in)
/admin/categories - categories editor
/admin/photos/recent - recent photos
/admin/drafts - drafts (support only microposts for now)
/admin/private - private posts list
/admin/debug - db connections test
/admin - admin dashboard (navigation links to the other admin pages here)

Navigation links to all these pages should also be in the top navigation menu (under humburger button). 

If the user is not logged in and tries to access admin pages, we should show the same Not found page, as when he tries to access a non-existing page.