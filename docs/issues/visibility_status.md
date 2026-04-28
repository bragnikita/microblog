# Visibility property of micropost

Values: 'private' (Private) and 'public' (Public). Default value is 'public'.

If the user is not logged in, only public posts are displaying on /microblog page.

# Status property of micropost

Values: 'published' (Published) | 'draft' (Draft) | 'archived' (Archived)

When the content (micropost) is stored as draft or archived, it has 'publishedAt' property empty.
When the content is going to be stored as published, it becomes the current time.
