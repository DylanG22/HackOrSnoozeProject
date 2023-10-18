"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}



async function getAndShowFavorites() {
  if(currentUser.favorites.length === 0){
    alert('There are no favorites');
    return
  }
  $allStoriesList.empty();

    for(let story of currentUser.favorites){
      const $story = generateStoryMarkup(story);
      $allStoriesList.append($story);
    }

    $allStoriesList.show();
  
}

$navFavorite.on('click', getAndShowFavorites);
/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  
  const hostName = story.getHostName();
  let showStar = Boolean(currentUser,story);
  let showTrash = checkOwnStory(currentUser,story);

  return $(`
      <li id="${story.storyId}">
      ${showStar ? generateStarHtml(story,currentUser) : ''}
      ${showTrash ? generateTrashHtml() : ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}


function checkOwnStory(user,story){
  let array = user.ownStories;
  return array.some((s) => s.storyId === story.storyId);
}
function generateTrashHtml(){
  return `<span class='trash'>
  <i class='fa fa-trash'></i>
  </span>`
}

 function generateStarHtml(story, user){
  let starClass = user.isFavorite(story) ? 'fas fa-star' : 'far fa-star';
  return `<span class='star'>
  <i class='${starClass}'></i>
  </span>`

}



/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

$body.on('click','.fa-star', handleStarClick);
$body.on('click','.fa-trash',handleTrashClick);

async function handleStarClick(e){

  let method = e.target.classList.contains('fas') ? 'remove' : 'add';
  
  let storyId = e.target.parentElement.parentElement.id;
  let story = storyList.stories.find((s) => s.storyId === storyId);

  if(method === 'remove'){
    e.target.classList.remove('fas');
    e.target.classList.add('far');
    await currentUser.removeFavorite(story);


  }
  else if(method === 'add'){
    e.target.classList.remove('far');
    e.target.classList.add('fas');
    await currentUser.addFavorite(story);
  }
}
async function handleTrashClick(e){
  let storyId = e.target.parentElement.parentElement.id;

  await storyList.removeStory(currentUser,storyId)
  
}


$storySubmitBtn.on('click',newStorySubmit)

async function newStorySubmit(e){
  e.preventDefault();
  let $author = $("#authInput")
  let $title = $("#titleInput")
  let $url = $("#urlInput")
  let storyInstance = await storyList.addStory(currentUser,{
    'title': $title[0].value,
    'author': $author[0].value,
    'url': $url[0].value
  })
  $title[0].value = ''
  $author[0].value = ''
  $url[0].value = ''
  

  let storyMarkup = generateStoryMarkup(storyInstance)
  $allStoriesList.prepend(storyMarkup);
}




