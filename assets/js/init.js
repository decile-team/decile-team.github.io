// Handle main navigation menu toggling on small screens
function navToggleHandler(e) {
	e.preventDefault();
	document.body.classList.toggle('js-nav-open');
	const btn = e.currentTarget || document.querySelector('.js-nav-toggle');
	if (btn) {
 		const expanded = btn.getAttribute('aria-expanded') === 'true';
 		btn.setAttribute('aria-expanded', String(!expanded));
 	}
}

window.addMainNavigationHandlers = function() {
	const navToggle = document.querySelectorAll('.js-nav-toggle');
	if (navToggle) {
		for (let i = 0; i < navToggle.length; i++) {
			navToggle[i].addEventListener('click', navToggleHandler, false);
		}
	}
};

window.removeMainNavigationHandlers = function() {
	document.body.classList.remove('js-nav-open');
	const navToggle = document.querySelectorAll('.js-nav-toggle');
	if (navToggle) {
		for (let i = 0; i < navToggle.length; i++) {
			navToggle[i].removeEventListener('click', navToggleHandler, false);
		}
	}
};

// Smooth scroll for same-page anchors
document.addEventListener('click', function(e){
	const a = e.target.closest('a[href^="#"]');
	if(!a) return;
	const href = a.getAttribute('href');
	if(href === '#' || href === '#0') return;
	const target = document.querySelector(href);
	if(target){
		e.preventDefault();
		target.scrollIntoView({behavior:'smooth', block:'start'});
		// close mobile nav if open
		if(document.body.classList.contains('js-nav-open')){
			document.body.classList.remove('js-nav-open');
			const btn = document.querySelector('.js-nav-toggle');
			if(btn) btn.setAttribute('aria-expanded','false');
		}
	}
}, false);
