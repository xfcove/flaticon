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
                }
                #search { 
                    width: 100%; 
                    padding: 8px; 
                    margin-bottom: 15px; 
                    border: 1px solid var(--vscode-input-border); 
                    background: var(--vscode-input-background); 
                    color: var(--vscode-input-foreground); 
                    border-radius: 4px; 
                    outline: none; 
                    box-sizing: border-box;
                }
                #search:focus {
                    border-color: var(--vscode-focusBorder);
                }
                .grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fill, minmax(65px, 1fr)); 
                    gap: 12px; 
                }
                .icon-box { 
                    border: 1px solid var(--vscode-panel-border); 
                    border-radius: 6px; 
                    padding: 12px; 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    cursor: pointer; 
                    transition: all 0.2s; 
                    background: var(--vscode-editor-background); 
                    aspect-ratio: 1; 
                }
                .icon-box:hover { 
                    background: var(--vscode-list-hoverBackground); 
                    border-color: var(--vscode-focusBorder); 
                    transform: scale(1.05);
                }
                .icon-box img { 
                    max-width: 100%; 
                    max-height: 100%; 
                    object-fit: contain; 
                    filter: drop-shadow(0px 0px 1px rgba(255,255,255,0.2));
                }
                #loading { 
                    display: none; 
                    text-align: center; 
                    margin-top: 20px; 
                    font-size: 12px; 
                    opacity: 0.7; 
                }
            </style>
        </head>
        <body>
            <input type="text" id="search" placeholder="Search icons (e.g., user, settings)..." />
            <div id="loading">Fetching icons...</div>
            <div class="grid" id="iconGrid"></div>

            <script>
                const vscode = acquireVsCodeApi();
                const searchInput = document.getElementById('search');
                const iconGrid = document.getElementById('iconGrid');
                const loading = document.getElementById('loading');

                async function fetchIcons(query) {
                    if (!query) return;
                    iconGrid.innerHTML = '';
                    loading.style.display = 'block';
                    
                    try {
                        const res = await fetch(\`https://api.iconify.design/search?query=\${query}&limit=40\`);
                        const data = await res.json();
                        loading.style.display = 'none';
                        
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
                                    vscode.postMessage({
                                        type: 'copyIcon',
                                        value: cdnUrl
                                    });
                                };
                                iconGrid.appendChild(box);
                            });
                        } else {
                            iconGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.7;">No icons found.</p>';
                        }
                    } catch (err) {
                        loading.style.display = 'none';
                        iconGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--vscode-errorForeground);">Error fetching data. Check network.</p>';
                    }
                }

                let timeout = null;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        fetchIcons(e.target.value);
                    }, 400);
                });

                fetchIcons('code');
            </script>
        </body>
        </html>`;
    }
}
//# sourceMappingURL=extension.js.map