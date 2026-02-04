(async function(){
    const owner = 'Pumpkin-MC', repo = 'Pumpkin';

    function detectOS(){
        const ua = navigator.userAgent || navigator.vendor || '';
        const platform = navigator.platform || '';
        if (/Windows/i.test(ua) || /Win/i.test(platform)) return 'Windows';
        if (/Macintosh|MacIntel|MacPPC|Mac68K|Mac OS X|MacOS/i.test(platform) || /Mac/i.test(ua)) return 'macOS';
        if (/Linux/i.test(platform) || /Linux/i.test(ua)) return 'Linux';
        return 'Unknown';
    }

    function detectArch(){
        try{
            const uaData = navigator.userAgentData;
            if(uaData && uaData.architecture) return uaData.architecture.includes('arm') ? 'ARM64' : 'X64';
        }catch(e){}
        const ua = navigator.userAgent || '';
        if (/arm|aarch64|arm64/i.test(ua)) return 'ARM64';
        if (/x86_64|x86-64|Win64|WOW64|amd64|x64/i.test(ua)) return 'X64';
        return 'X64';
    }

    function mapTokens(os, arch){
        const osMap = { 'Windows': 'Windows', 'Linux': 'Linux', 'macOS': 'macOS' };
        const archMap = { 'X64': 'X64', 'ARM64': 'ARM64' };
        return { osToken: osMap[os] || 'Linux', archToken: archMap[arch] || 'X64' };
    }

    function buildUrl(osToken, archToken){
        const ext = osToken === 'Windows' ? '.exe' : '';
        return `https://github.com/${owner}/${repo}/releases/download/nightly/pumpkin-${archToken}-${osToken}${ext}`;
    }

    const detectedEl = document.getElementById('quick-detected');
    const btn = document.getElementById('quick-download-btn');
    const metaEl = document.getElementById('quick-release-meta');

    try{
        const os = detectOS();
        const arch = detectArch();

        // Default assumption when detection fails
        const assumedOs = 'Linux';
        const assumedArch = 'ARM64';

        // Use assumed defaults for the actual download target if detection fails
        const targetOs = (os === 'Unknown') ? assumedOs : os;
        const targetArch = (arch === 'Unknown') ? assumedArch : arch;

        // Left column: show actual detection when available, otherwise show assumed
        if (os === 'Unknown') {
            detectedEl.textContent = `${assumedOs} — ${assumedArch}`;
        } else {
            detectedEl.textContent = `${os} — ${arch}`;
        }

        const visibleOs = (os === 'Unknown') ? 'Unknown' : os;
        const visibleArch = (arch === 'Unknown') ? assumedArch : arch;

        const tokens = mapTokens(targetOs, targetArch);
        const suggested = buildUrl(tokens.osToken, tokens.archToken);
        btn.href = suggested;

        const visibleText = `Download Pumpkin for ${visibleOs} (${visibleArch})`;
        btn.textContent = visibleText;
        const aria = `Download Pumpkin for ${targetOs} (${targetArch})`;
        btn.setAttribute('aria-label', aria);

        // Fetch latest release list (first item is the very latest, including pre-releases)
        const relsResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`);
        if(relsResp.ok){
            const rels = await relsResp.json();
            const latest = Array.isArray(rels) && rels.length ? rels[0] : null;
            if(latest){
                // Relative time for <24 hours, otherwise show date
                function timeAgoOrDate(iso){
                    const then = new Date(iso).getTime();
                    const diff = Date.now() - then;
                    const s = Math.floor(diff/1000);
                    if (s < 10) return 'just now';
                    if (s < 60) return `${s}s ago`;
                    const m = Math.floor(s/60);
                    if (m < 60) return `${m} mins ago`;
                    const h = Math.floor(m/60);
                    if (h < 24) return `${h} hours ago`;
                    return new Date(iso).toLocaleDateString();
                }

                // Prefer the most recently updated/created asset's time if available
                if(Array.isArray(latest.assets) && latest.assets.length){
                    let newest = latest.assets[0];
                    for(const a of latest.assets){
                        const aTime = a.updated_at || a.created_at || latest.published_at;
                        const nTime = newest.updated_at || newest.created_at || latest.published_at;
                        if(new Date(aTime) > new Date(nTime)) newest = a;
                    }
                    const assetTime = newest.updated_at || newest.created_at || latest.published_at;
                    metaEl.textContent = `Latest build: ${timeAgoOrDate(assetTime)}`;
                } else if(latest.published_at){
                    metaEl.textContent = `Latest build: ${timeAgoOrDate(latest.published_at)}`;
                }
                const tag = latest.tag_name;
                if(tag){
                    // Fast path: try commits API with the tag as ref to get the exact commit quickly
                    try{
                        const commitResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/${encodeURIComponent(tag)}`);
                        if(commitResp.ok){
                            const commit = await commitResp.json();
                            const sha = commit.sha;
                            const short = sha.slice(0,7);
                            metaEl.innerHTML += ` • <a href="https://github.com/${owner}/${repo}/commit/${sha}" target="_blank" rel="noopener"> ${short}</a>`;
                        } else {
                            // fallback: resolve tag ref -> tag object -> commit
                            const refResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/ref/tags/${encodeURIComponent(tag)}`);
                            if(refResp.ok){
                                const ref = await refResp.json();
                                let sha = ref.object && ref.object.sha;
                                let type = ref.object && ref.object.type;
                                if(type === 'tag'){
                                    const tagObjResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/tags/${sha}`);
                                    if(tagObjResp.ok){
                                        const tagObj = await tagObjResp.json();
                                        sha = tagObj.object && tagObj.object.sha ? tagObj.object.sha : sha;
                                    }
                                }
                                if(sha){
                                    const short = sha.slice(0,7);
                                    metaEl.innerHTML += ` • <a href="https://github.com/${owner}/${repo}/commit/${sha}" target="_blank" rel="noopener">commit ${short}</a>`;
                                }
                            }
                        }
                    }catch(e){ /* ignore commit resolution errors */ }
                }
            } else {
                metaEl.innerHTML = `<a href="https://github.com/${owner}/${repo}/releases" target="_blank">View releases on GitHub</a>`;
            }
        } else {
            metaEl.innerHTML = `<a href="https://github.com/${owner}/${repo}/releases" target="_blank">View releases on GitHub</a>`;
        }
    }catch(e){
        detectedEl.textContent = 'Unable to auto-detect platform. Use the manual options below.';
        btn.href = 'https://github.com/Pumpkin-MC/Pumpkin/releases';
        btn.textContent = 'Releases';
        btn.setAttribute('aria-label', 'View releases on GitHub');
        metaEl.innerHTML = `<a href="https://github.com/Pumpkin-MC/Pumpkin/releases" target="_blank">View builds on GitHub</a>`;
    }
})();
