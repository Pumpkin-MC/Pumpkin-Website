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
        detectedEl.textContent = `${os} — ${arch}`;
        const tokens = mapTokens(os, arch);
        const suggested = buildUrl(tokens.osToken, tokens.archToken);
        btn.href = suggested;
        const download_str = `Download Pumpkin for ${os} (${arch})`
        btn.textContent = download_str;
        btn.setAttribute('aria-label', download_str);

        // Fetch latest release list (first item is the very latest, including pre-releases)
        const relsResp = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`);
        if(relsResp.ok){
            const rels = await relsResp.json();
            const latest = Array.isArray(rels) && rels.length ? rels[0] : null;
            if(latest){
                if(latest.published_at){
                    const published = new Date(latest.published_at).toLocaleDateString();
                    metaEl.textContent = `Latest build: ${published}`;
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
