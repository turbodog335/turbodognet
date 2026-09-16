(() => {
  const playlist = [
    { title: "when the moon reaches for the stars", artist: "Azumi Takahashi", src: "assets/song0.mp3" },
    { title: "New kind of love", artist: "Frou Frou", src: "assets/song.mp3" },
    { title: "для тебя", artist: "дарк бриллиант корсес", src: "assets/song2.mp3" },
    { title: "Оторву руки", artist: "Villian", src: "assets/song3.mp3" },
    { title: "Мешают спать", artist: "Villian", src: "assets/song4.mp3" },
    { title: "Bender++Girlfriend", artist: "Yung Lean", src: "assets/song5.mp3" },
   { title: "Bye.Bay", artist: "Zombiqe", src: "assets/song6.mp3" },
    { title: "Untited junkies", artist: "Platov", src: "assets/song13.mp3" },
    { title: "Forest", artist: "Platov", src: "assets/song12.mp3" },
    { title: "Safe Place", artist: "Sqwore", src: "assets/Safe Place.mp3" }
  ];

  const KEY = { track:"site_music_track", time:"site_music_time", volume:"site_music_volume" };
  const $ = id => document.getElementById(id);
  let audio, current = Number(localStorage.getItem(KEY.track) || 0);
  let timeSaveTimer;

  if (!Number.isFinite(current) || current < 0 || current >= playlist.length) current = 0;

  function makePlayer() {
    audio = document.createElement("audio");
    audio.id = "global-audio";
    audio.preload = "metadata";
    document.body.appendChild(audio);

    const box = document.createElement("div");
    box.id = "music-player";
    box.innerHTML = `
      <div class="player-top">
        <button id="music-prev" title="Предыдущий">◀</button>
        <button id="music-toggle">▶ PLAY</button>
        <button id="music-next" title="Следующий">▶</button>
        <span id="music-title"></span>
      </div>
      <div class="player-seek">
        <span id="music-current">0:00</span>
        <input id="music-seek" type="range" min="0" max="100" value="0" step="0.1">
        <span id="music-duration">0:00</span>
      </div>
      <div class="player-bottom">
        <label>VOL <input id="music-volume" type="range" min="0" max="1" step="0.01"></label>
        <button id="music-list-toggle">☰ TRACKS</button>
      </div>
      <div id="music-list"></div>`;
    document.body.appendChild(box);

    const volume = $("music-volume");
    volume.value = localStorage.getItem(KEY.volume) ?? "0.65";
    audio.volume = Number(volume.value);

    $("music-toggle").onclick = togglePlay;
    $("music-prev").onclick = () => changeTrack(-1);
    $("music-next").onclick = () => changeTrack(1);
    $("music-list-toggle").onclick = () => $("music-list").classList.toggle("open");
    volume.oninput = () => {
      audio.volume = Number(volume.value);
      localStorage.setItem(KEY.volume, volume.value);
    };
    $("music-seek").oninput = e => {
      if (audio.duration) audio.currentTime = audio.duration * Number(e.target.value) / 100;
    };

    audio.ontimeupdate = updateProgress;
    audio.onloadedmetadata = updateProgress;
    audio.onplay = updateButton;
    audio.onpause = updateButton;
    audio.onended = () => changeTrack(1);

    loadTrack(current, false);
    timeSaveTimer = setInterval(saveTime, 1000);
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";
    return `${Math.floor(seconds/60)}:${Math.floor(seconds%60).toString().padStart(2,"0")}`;
  }

  function loadTrack(index, autoplay = false) {
    current = (index + playlist.length) % playlist.length;
    const track = playlist[current];
    audio.src = track.src;
    audio.load();
    $("music-title").textContent = `♫ ${track.title} — ${track.artist}`;
    localStorage.setItem(KEY.track, current);

    const saved = Number(localStorage.getItem(KEY.time) || 0);
    const restore = () => {
      if (saved > 0 && saved < audio.duration) audio.currentTime = saved;
      updateProgress();
    };
    audio.addEventListener("loadedmetadata", restore, { once:true });

    renderList();
    updateButton();
    if (autoplay) audio.play().catch(() => {});
  }

  function changeTrack(delta) {
    localStorage.setItem(KEY.time, "0");
    loadTrack(current + delta, true);
  }

  function togglePlay() {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  function updateButton() {
    if ($("music-toggle")) $("music-toggle").textContent = audio.paused ? "▶ PLAY" : "❚❚ PAUSE";
  }

  function updateProgress() {
    if (!$("music-seek")) return;
    const duration = audio.duration || 0;
    $("music-current").textContent = formatTime(audio.currentTime);
    $("music-duration").textContent = formatTime(duration);
    $("music-seek").value = duration ? audio.currentTime / duration * 100 : 0;
  }

  function saveTime() {
    if (audio && !audio.paused) localStorage.setItem(KEY.time, String(audio.currentTime));
  }

  function renderList() {
    const list = $("music-list");
    list.innerHTML = playlist.map((t,i) =>
      `<button class="${i===current ? "selected":""}" data-track="${i}">
        <b>${i+1}.</b> ${t.title}<small>${t.artist}</small>
      </button>`).join("");
    list.querySelectorAll("[data-track]").forEach(btn => {
      btn.onclick = () => {
        localStorage.setItem(KEY.time, "0");
        loadTrack(Number(btn.dataset.track), true);
      };
    });
  }

  // SPA navigation: changing sections changes only the visible content.
  // The document, audio element and player are NOT reloaded.
  const titles = {
    home:"turbodog335/turbosabaka335/turbodog335lox/emokitty335/сережадурдомик",
    about:"Инфа обо мне(если вам вдруг интересно)",
    music:"Моя музыка",
    games:"turbodog335 — Игры",
    links:"Сошал линки"
  };

  function showSection(name, push = false) {
    if (!titles[name]) name = "home";
    document.querySelectorAll(".site-section").forEach(s => {
      s.classList.toggle("active-section", s.dataset.page === name);
    });
    document.querySelectorAll(".menu a[data-section]").forEach(a => {
      a.classList.toggle("active", a.dataset.section === name);
    });
    $("page-titlebar").textContent = titles[name];
    document.title = name === "home" ? "Сережааточкакок^_^" : titles[name];
    if (push) history.pushState({section:name}, "", `#${name}`);
    window.scrollTo(0, 0);
  }

  document.querySelectorAll(".menu a[data-section]").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      showSection(a.dataset.section, true);
    });
  });

  window.addEventListener("popstate", () => showSection(location.hash.slice(1), false));
  window.addEventListener("hashchange", () => showSection(location.hash.slice(1), false));

  makePlayer();
  showSection(location.hash.slice(1) || "home", false);
})();
