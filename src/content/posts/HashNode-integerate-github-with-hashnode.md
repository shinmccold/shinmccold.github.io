---
title: "Write once, publish everywhere: Integrate Github pages with Hashnode blogs"
description: "Integrate Github pages with Hashnode blogs"
pubDate: "2025-01-19 20:00:48"
category: "tech"
banner: "@images/banners/about_me_banner.png"
tags: ["tech"]
selected: true
oldViewCount: 1
oldKeywords: ["ShinMcCold", "Hashnode", "Github", "Integrate"]
---

I always wanted one place to write my blogs and publish them everywhere like on Hashnode or Medium (WIP). It's always time consuming to manually write and publish everywhere.
 
So, I thought why not automate it ?   
<img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWRleHZxMjNxemhlNzgybWh3dG11MXN0Z3p1OGU0MXNqM3A1ZmFreiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1nR6fu93A17vWZbO9c/giphy.gif" alt="Automate GIF" width="350" height="200">

Since I am comfortable with Markdowns, and all I have to do is write in markdown its quite easier for me to maintain this single blog site.  

Now all I have to do is figure out a way to publish in Hashnode.
Hashnode is pretty cool 😎 and I love the community there. It has the api's to publish blogs.

So here's the overall idea 💡: 
1. Write blogs in markdown
2. Detect file changes which were present only in `posts` folder.
3. Publish the blog in Hashnode using Hashnode API.

btw this was the API I used to publish the blog in Hashnode : 
![alt text](@images/posts/hashnode/hashnode-api.png)

Now step 1 and step 2 are pretty easy. I can use Github actions to detect file changes and publish the blog in Hashnode, but I didn't wanted to use Github actions because it was again time consuming.

So I thought why not use astro's post processing, where in after the project is built I can run a script to publish the blog in Hashnode.

But for this to happen I needed a way to detect changes and the only way was to compare it with previous change and check if the file was added or modified (assuming hashnode will take care of it since only title is required to for uniqueness I guess).

In git we can compare two commits and get the changes between them, for me I only wanted `changeType` (either M or A) and `fileName` which was present in `posts` folder.
```bash
git diff HEAD^ HEAD --name-status
```
Output :
```bash
M posts/AboutMe-shinmccold.md
```

Voila ! I got the changes and now I can publish the blog in Hashnode.  
<img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWM2b2d2cGhrbG04M3Zydzd3ODlmOThoNXluYjJzMXd5b3p3anR3aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufdipQqU2lhNA4g/giphy.gif" alt="wow GIF" width="200" height="200">

So I wrote a script to detect changes and publish the blog in Hashnode.


> Note: Special thanks to my friend who is an expert in Git and Gerrit, who quickly gave the solution for this that even AI couldn't give me. 🙌


## Connect With Me
* Github: [@shinmccold](github.com/shinmccold)
* Twitter: [@shinmccold1](https://twitter.com/shinmccold1)
* Youtube: [@shinmccold](https://www.youtube.com/@shinmccold)
* Email: shinmccold@yahoo.com
