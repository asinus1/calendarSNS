'use strict';
import $ from 'jquery';
/*
const global = Function('return this;')();
global.jQuery = $;
import bootstrap from 'bootstrap';
*/

/*
$('.followedButton').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const viewuser = button.data('viewuser-id');
    const eventuser = button.data('eventuser-id');
    $.post(`/${eventuser}/unfollow/${viewuser}`);
  });
});
*/

$('.follow-toggle-button').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const viewuser = button.data('viewuser-id');
    const eventuser = button.data('eventuser-id');
    const isFollowed = parseInt(button.data('isfollowed'));
    const isFollowed_next = 1 - isFollowed;
    if (isFollowed) {
      $.post(`/${eventuser}/unfollow/${viewuser}`, {isFollowed: isFollowed_next}, data => {
        button.data('isfollowed', data.isFollowed);
        const buttonLabels = ['フォローする', 'フォローしています'];
        button.text(buttonLabels[data.isFollowed]);
      });
    } else {
      $.post(`/${eventuser}/follow/${viewuser}`, {isFollowed: isFollowed_next}, data => {
        button.data('isfollowed', data.isFollowed);
        const buttonLabels = ['フォローする', 'フォローしています'];
        button.text(buttonLabels[data.isFollowed]);
      });      
    }    
  });
});

$('.noAuthenticatedFollowButton').each((i, e) => {
  const button = $(e);
  button.click(() => {
    location.href = "/login";
  })
});

$('.eventfollow-toggle-button').each((i, e) => {
  const button = $(e);
  button.click(() => {
    const userId = button.data('user-id');
    const eventId = button.data('event-id');
    const isFollowed = parseInt(button.data('isfollowed'));
    const isFollowed_next = 1 - isFollowed;
    if (isFollowed) {
      $.post(`/events/${eventId}/unfollow/${userId}`, {isFollowed: isFollowed_next}, data => {
        button.data('isfollowed', data.isFollowed);
        const buttonLabels = ['イベントをフォローする', 'フォローしています'];
        button.text(buttonLabels[data.isFollowed]);
      });
    } else {
      $.post(`/events/${eventId}/follow/${userId}`, {isFollowed: isFollowed_next}, data => {
        button.data('isfollowed', data.isFollowed);
        const buttonLabels = ['イベントをフォローする', 'フォローしています'];
        button.text(buttonLabels[data.isFollowed]);
      });      
    }    
  });
});

$('.noAuthenticatedEventFollowButton').each((i, e) => {
  const button = $(e);
  button.click(() => {
    location.href = "/login";
  })
});