/* Highkeep service worker. © 2026 WingsCrew. All rights reserved.
   Deliberately tiny. It does NOT cache anything, so new versions of the app always load normally.
   Its only jobs: let the page show notifications, and open Highkeep when a notification is tapped. */
self.addEventListener('install',function(){self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim());});
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  var id=e.notification.data&&e.notification.data.id;
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(function(list){
    for(var i=0;i<list.length;i++){var c=list[i];if('focus' in c){try{c.postMessage({type:'hk-open',id:id});}catch(x){}return c.focus();}}
    if(self.clients.openWindow)return self.clients.openWindow(new URL('./#/remind',self.registration.scope).href);
  }));
});
