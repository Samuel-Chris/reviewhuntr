document.addEventListener('DOMContentLoaded', function(){ 
  const $ = (el) => document.querySelector(el)

  let postURLs,
      isFetchingPosts = false,
      shouldFetchPosts = true,
      postsToLoad = $(".content-box").childNodes.length,
      loadNewPostsThreshold = 3000;
  
  // Load the JSON file containing all URLs
  fetch('/api-posts.json')
    .then(response => {
      return response.json()
    })
    .then(data => {
      postURLs = data["posts"];

      // If there aren't any more posts available to load than already visible, disable fetching
      if (postURLs.length <= postsToLoad) {
        disableFetching();    
      }
    })
    .catch(err => {
      console.log(err)
    })
 
  // If there's no spinner, it's not a page where posts should be fetched
  if ($(".infinite-spinner").length < 1) {
      shouldFetchPosts = false;
  }
  
  // Are we close to the end of the page? If we are, load more posts
  window.onscroll = function(e) {
      if (!shouldFetchPosts || isFetchingPosts) return;
      if (this.oldScroll > this.scrollY) return;
      
      if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - 100) {
        // alert("you're at the bottom of the page");
        fetchPosts();
      } 
      
      // If we've scrolled past the loadNewPostsThreshold, fetch posts
    
  };

  // Fetch a chunk of posts
  function fetchPosts() {
      // Exit if postURLs haven't been loaded
      if (!postURLs) return;

      isFetchingPosts = true;

      // Load as many posts as there were present on the page when it loaded
      // After successfully loading a post, load the next one
      var loadedPosts = 0,
          postCount = $(".content-box").childNodes.length,
          callback = () => {
            loadedPosts++;
            var postIndex = postCount + loadedPosts;

            if (postIndex > postURLs.length-1) {
              disableFetching();
              return;
            }

            if (loadedPosts < postsToLoad) {
              fetchPostWithIndex(postIndex, callback);
            } else {
              isFetchingPosts = false;
            }
          };
  		console.log("post count: ", postCount)
      fetchPostWithIndex(postCount + loadedPosts, callback);
  }


  function fetchPostWithIndex(index, callback) {
      var postURL = postURLs[index];
          console.log(postURL)
      fetch(postURL)
      .then(response => {
        return response.text()
      })
      .then(html => {
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");
        let post = doc.querySelector(".post")
        console.log(post)
        post.style.display = "inherit";
        $(".content-box").appendChild(post);
        callback();
      })
      .catch(err => {
        console.log(err)
      })
    }

    function disableFetching() {
      shouldFetchPosts = false;
      isFetchingPosts = false;
      fadeOut(".infinite-spinner");
    }
  

  function fadeOut(el) {
      var fadeTarget = document.querySelector(el)
      var fadeEffect = setInterval(function () {
          if (!fadeTarget.style.opacity) {
              fadeTarget.style.opacity = 1;
          }
          if (fadeTarget.style.opacity > 0) {
              fadeTarget.style.opacity -= 0.1;
          } else {
              clearInterval(fadeEffect);
              fadeTarget.style.display = "none"
          }
      }, 200);
  };

}, false);