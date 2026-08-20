/* ==========================================================================
   Mentora Loop — Partial Loader
   Fetches each section's standalone .html file from /partials and injects
   it into its mount point in index.html. Must run before main.js binds
   interactions, since those elements don't exist until this finishes.
   ========================================================================== */

async function loadPartial(mountSelector, url) {
  const mount = document.querySelector(mountSelector);
  if (!mount) return;
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    mount.innerHTML = await res.text();
  } catch (err) {
    mount.innerHTML = `<p style="padding:40px;text-align:center;color:#6B7280">
      Could not load this section (${url}). If you opened index.html directly
      from your file system, run a local server instead — e.g.
      <code>python3 -m http.server</code> — then open the page via
      http://localhost:8000.
    </p>`;
    console.error(err);
  }
}

async function loadAllPartials() {
  await Promise.all([
    loadPartial('#mount-nav', 'partials/nav.html'),
    loadPartial('#mount-hero', 'partials/hero.html'),
    loadPartial('#mount-categories', 'partials/categories.html'),
    loadPartial('#mount-loop', 'partials/loop.html'),
    loadPartial('#mount-roles', 'partials/roles.html'),
    loadPartial('#mount-features', 'partials/features.html'),
    loadPartial('#mount-community', 'partials/community.html'),
    loadPartial('#mount-stats', 'partials/stats.html'),
    loadPartial('#mount-footer', 'partials/footer.html'),
  ]);

  document.dispatchEvent(new CustomEvent('partials:loaded'));

  const loader = document.getElementById('page-loader');
  document.body.classList.remove('is-loading');
  if (loader) loader.classList.add('hide');
}

loadAllPartials();
