/* dialog.js: the one helper for every <dialog class="dialog"> (mockup dialog-pattern; the build lifts it unchanged).
   Native showModal() gives Escape, the focus trap, inert page and focus restore. This adds: [data-open], [data-close],
   backdrop click, upgrade of a server-rendered <dialog open>, [data-locked] cancel gating, and show() for non-modal flyouts. */
(function(){
  var wide=matchMedia("(min-width:1024px)"),from=new WeakMap(),down;
  function open(d,t){
    if(d.matches(":modal"))return;
    from.set(d,t||document.activeElement); /* the opener is passed: Safari/iOS does not focus a link or button on click */
    d.removeAttribute("open");
    d.classList.contains("dialog--flyout")&&wide.matches?d.show():d.showModal();
  }
  document.addEventListener("pointerdown",function(e){down=e.target});
  document.addEventListener("click",function(e){
    var t=e.target.closest("[data-open],[data-close]"),d;
    if(e.target.matches("dialog.dialog")&&down===e.target&&!e.target.hasAttribute("data-locked"))return e.target.close();
    if(!t)return;
    if(t.hasAttribute("data-open")){if(t.matches("a[href]")&&(e.metaKey||e.ctrlKey||e.shiftKey))return;d=document.getElementById(t.getAttribute("data-open"));if(d){e.preventDefault();open(d,t)}return}
    if(d=t.closest("dialog.dialog")){e.preventDefault();d.close(t.getAttribute("data-close"))}
  });
  document.addEventListener("cancel",function(e){if(e.target.hasAttribute("data-locked"))e.preventDefault()},true);
  document.addEventListener("keydown",function(e){
    var d=e.key==="Escape"&&document.activeElement.closest("dialog.dialog[open]");
    if(d&&!d.matches(":modal")&&!d.hasAttribute("data-locked"))d.close();
  });
  document.addEventListener("close",function(e){var f=from.get(e.target);if(f&&f!==document.body&&f.isConnected)f.focus()},true);
  document.querySelectorAll("dialog.dialog[open]").forEach(function(d){open(d)});
})();
