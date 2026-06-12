"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    const provider = new FlaticonViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(FlaticonViewProvider.viewType, provider));
}
class FlaticonViewProvider {
    _extensionUri;
    static viewType = "flaticon.sidebarView";
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getHtmlForWebview();
        // Listen for messages from the Webview
        webviewView.webview.onDidReceiveMessage((data) => {
            switch (data.type) {
                case "copyIcon":
                    vscode.env.clipboard.writeText(data.value);
                    vscode.window.showInformationMessage("CDN link copied to clipboard!");
                    break;
            }
        });
    }
    _getHtmlForWebview() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src https://api.iconify.design;">
            <title>Flaticon Gallery</title>
            <style>
                body { 
                    font-family: var(--vscode-font-family); 
                    padding: 10px; 
                    background-color: var(--vscode-editor-background); 
                    color: var(--vscode-editor-foreground); 
                    display: flex;
                    flex-direction: column;
                    height: 95vh;
                    margin: 0;
                }
                #search-container {
                    flex-shrink: 0;
                    margin-bottom: 15px;
                }
                #search { 
                    width: 100%; 
                    padding: 10px; 
                    border: 1px solid var(--vscode-input-border); 
                    background: var(--vscode-input-background); 
                    color: var(--vscode-input-foreground); 
                    border-radius: 6px; 
                    outline: none; 
                    box-sizing: border-box;
                    font-size: 14px;
                }
                #search:focus {
                    border-color: var(--vscode-focusBorder);
                }
                #scroll-area {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding-bottom: 10px;
                }
                .grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); 
                    gap: 15px; 
                }
                .icon-box { 
                    border: 1px solid var(--vscode-panel-border); 
                    border-radius: 8px; 
                    padding: 15px; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    cursor: pointer; 
                    transition: all 0.2s ease; 
                    background-color: #ffffff; 
                    aspect-ratio: 1; 
                }
                .icon-box:hover { 
                    background-color: #f0f0f0; 
                    border-color: var(--vscode-focusBorder); 
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }
                .icon-box img { 
                    width: 80%; 
                    height: 80%; 
                    object-fit: contain; 
                }
                #loading { 
                    display: none; 
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    margin-top: 50px; 
                    font-size: 14px; 
                    opacity: 0.8; 
                }
                #loading img {
                    width: 45px;
                    height: 45px;
                    margin-bottom: 15px;
                    animation: pulse 0.8s infinite alternate;
                }
                /* Pagination Styles */
                #pagination {
                    flex-shrink: 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 15px;
                    margin-top: auto;
                    border-top: 1px solid var(--vscode-panel-border);
                }
                .page-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 12px;
                    font-family: inherit;
                }
                .page-btn:hover {
                    background: var(--vscode-button-hoverBackground);
                }
                .page-btn:disabled {
                    background: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    cursor: not-allowed;
                    opacity: 0.6;
                }
                #page-info {
                    font-size: 12px;
                    opacity: 0.8;
                }
                @keyframes pulse {
                    from { transform: scale(0.9); opacity: 0.8; }
                    to { transform: scale(1.1); opacity: 1; }
                }
            </style>
        </head>
        <body>
            <div id="search-container">
                <input type="text" id="search" placeholder="Search icons..." autocomplete="off" />
            </div>
            
            <div id="scroll-area">
                <div id="loading"></div>
                <div class="grid" id="iconGrid"></div>
            </div>

            <div id="pagination" style="display: none;">
                <button id="prevBtn" class="page-btn">Previous</button>
                <span id="page-info">Page 1</span>
                <button id="nextBtn" class="page-btn">Next</button>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                const searchInput = document.getElementById('search');
                const iconGrid = document.getElementById('iconGrid');
                const loading = document.getElementById('loading');
                const paginationContainer = document.getElementById('pagination');
                const prevBtn = document.getElementById('prevBtn');
                const nextBtn = document.getElementById('nextBtn');
                const pageInfo = document.getElementById('page-info');

                // Pagination State
                let currentQuery = 'logo'; // Default startup query
                let currentPage = 0;
                const itemsPerPage = 60; // Load 60 icons at a time
                let totalResults = 0;

                const brandIcons = [
                    'logos:react', 'logos:nodejs-icon', 'logos:python', 
                    'logos:javascript', 'logos:typescript-icon', 'logos:docker-icon'
                ];

                function getRandomBrandIcon() {
                    const randomIndex = Math.floor(Math.random() * brandIcons.length);
                    return \`https://api.iconify.design/\${brandIcons[randomIndex]}.svg\`;
                }

                async function fetchIcons(query, page = 0) {
                    // Fallback to default gallery if search is empty
                    if (!query.trim()) query = 'logo';
                    
                    currentQuery = query;
                    currentPage = page;
                    const startOffset = page * itemsPerPage;

                    iconGrid.innerHTML = '';
                    paginationContainer.style.display = 'none';
                    loading.innerHTML = \`<img src="\${getRandomBrandIcon()}" alt="Loading..." /><span>Loading gallery...</span>\`;
                    loading.style.display = 'flex';
                    
                    try {
                        const res = await fetch(\`https://api.iconify.design/search?query=\${query}&limit=\${itemsPerPage}&start=\${startOffset}\`);
                        const data = await res.json();
                        
                        loading.style.display = 'none';
                        totalResults = data.total || 0;
                        
                        if (data.icons && data.icons.length > 0) {
                            data.icons.forEach(iconName => {
                                const cdnUrl = \`https://api.iconify.design/\${iconName}.svg\`;
                                
                                const box = document.createElement('div');
                                box.className = 'icon-box';
                                box.title = "Click to copy CDN link";
                                
                                const img = document.createElement('img');
                                img.src = cdnUrl;
                                
                                box.appendChild(img);
                                box.onclick = () => {
                                    vscode.postMessage({ type: 'copyIcon', value: cdnUrl });
                                };
                                iconGrid.appendChild(box);
                            });
                            
                            updatePaginationUI();
                        } else {
                            iconGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.7;">No icons found.</p>';
                        }
                    } catch (err) {
                        loading.style.display = 'none';
                        iconGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--vscode-errorForeground);">Error fetching data. Check network.</p>';
                    }
                }

                function updatePaginationUI() {
                    if (totalResults <= itemsPerPage) {
                        paginationContainer.style.display = 'none';
                        return;
                    }
                    
                    paginationContainer.style.display = 'flex';
                    pageInfo.textContent = \`Page \${currentPage + 1} of \${Math.ceil(totalResults / itemsPerPage)}\`;
                    
                    prevBtn.disabled = currentPage === 0;
                    nextBtn.disabled = (currentPage + 1) * itemsPerPage >= totalResults;
                }

                prevBtn.onclick = () => fetchIcons(currentQuery, currentPage - 1);
                nextBtn.onclick = () => fetchIcons(currentQuery, currentPage + 1);

                let timeout = null;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        // Reset to page 0 on a new search
                        fetchIcons(e.target.value, 0);
                    }, 400);
                });

                // Load initial gallery of brand logos
                fetchIcons('logo', 0);
            </script>
        </body>
        </html>`;
    }
}
//# sourceMappingURL=extension.js.map