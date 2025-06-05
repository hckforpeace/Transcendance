function getFriendCardView(callback: () => void) {
  fetch('/html/friendProfile.html')
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch');
      return response.text();
    })
    .then(data => {
      injectViewToContentDiv(data);
      // Ensure DOM update before callback
      setTimeout(callback, 0);
    });
}

function getFriendInfo(id: number) {
  fetch('/api/profile/friend/info/' + id)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      return response.json(); // ✅ return the parsed JSON
    })
  .then(data => {
      updateFieldsFriendsCard(data);
    })
}


function getFriendStats(id: number) {
  fetch('/api/profile/friend/stats/' + id)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      return response.json(); // ✅ return the parsed JSON
    })
  .then(data => {
      console.log(data)
    updateStates(data)
    })
}
