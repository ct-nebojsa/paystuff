<template>
    <div class="xml-wrapper">
        <div class="card">
            <h2 class="page-title">XML parser</h2>
            <p class="muted-text mb-4">Paste XML to validate it, format it, and browse it as a tree. Nothing leaves the
                browser.</p>

            <div class="xml-search">
                <label class="field-label-top" for="xml-search">Search</label>
                <div class="xml-search-control">
                    <input id="xml-search" class="field-input field-control-wide" type="search" v-model="query"
                        :disabled="!parsed" placeholder="Tag name, attribute, or value"
                        autocomplete="off">
                    <button v-if="query" class="btn-secondary xml-search-clear" @click="query = ''">Clear</button>
                </div>
                <p class="xml-search-hint" aria-live="polite">
                    <template v-if="!parsed">Parse XML first to search it.</template>
                    <template v-else-if="!normalizedQuery">Narrows the tree to matching elements and their
                        parents.</template>
                    <template v-else-if="matchCount">{{ matchCount }} {{ matchCount === 1 ? 'match' : 'matches' }}, shown
                        with their parents.</template>
                    <template v-else>No matches. Clear the search to see the full tree.</template>
                </p>
            </div>

            <div class="xml-layout">
                <div class="form-group">
                    <div class="form-group-title">Source</div>
                    <textarea class="field-textarea xml-input" v-model="source" spellcheck="false"
                        placeholder="<request>&#10;  <merchantId>Test</merchantId>&#10;</request>"
                        aria-label="XML source" @blur="onBlur"></textarea>

                    <div class="xml-toolbar">
                        <button class="btn-primary" :disabled="!source.trim()" @click="parse">Parse XML</button>
                        <button class="btn-secondary" :disabled="!parsed" @click="applyFormatting">Format
                            source</button>
                        <button class="btn-secondary" @click="loadSample">Load sample</button>
                        <button class="btn-secondary" :disabled="!source" @click="clearAll">Clear</button>
                    </div>
                </div>

                <div class="form-group">
                    <div class="field-heading-row mb-3">
                        <div class="form-group-title xml-result-title">Result</div>
                        <div v-if="parsed" class="xml-tabs" role="tablist" aria-label="Result view">
                            <button v-for="tab in tabs" :key="tab.id" class="xml-tab"
                                :class="{ active: activeTab === tab.id }" role="tab"
                                :aria-selected="activeTab === tab.id" @click="activeTab = tab.id">
                                {{ tab.label }}
                            </button>
                        </div>
                    </div>

                    <p v-if="error" class="xml-error" role="alert">
                        <strong>XML is not well formed.</strong> {{ error }}
                    </p>

                    <p v-else-if="!parsed" class="xml-empty">
                        No result yet. Paste XML on the left, then select Parse XML.
                    </p>

                    <template v-else>
                        <p class="xml-stats">
                            {{ stats.elements }} elements, {{ stats.attributes }} attributes, {{ stats.depth }} levels
                            deep. Root: <span class="mono">{{ stats.root }}</span>
                        </p>

                        <div v-if="activeTab === 'tree'" class="xml-tree">
                            <div v-if="!normalizedQuery" class="xml-toolbar xml-toolbar-tight">
                                <button class="btn-secondary" @click="expandAll">Expand all</button>
                                <button class="btn-secondary" @click="collapseAll">Collapse all</button>
                            </div>
                            <p v-if="normalizedQuery && !matchCount" class="xml-empty">
                                Nothing matches "{{ query.trim() }}". Try a tag name, an attribute, or a value.
                            </p>
                            <div v-for="node in visibleNodes" :key="node.id" class="xml-node"
                                :class="{ hit: matchedIds.has(node.id) }"
                                :style="{ paddingLeft: node.depth * 16 + 'px' }">
                                <button v-if="node.hasChildren && !normalizedQuery" class="xml-toggle"
                                    :aria-expanded="!collapsed[node.id]"
                                    :aria-label="(collapsed[node.id] ? 'Expand ' : 'Collapse ') + node.name"
                                    @click="toggle(node.id)">
                                    {{ collapsed[node.id] ? '+' : '−' }}
                                </button>
                                <span v-else class="xml-toggle-spacer" aria-hidden="true"></span>

                                <span class="xml-tag mono">{{ node.name }}</span>
                                <span v-for="attr in node.attrs" :key="attr.name" class="xml-attr mono">
                                    {{ attr.name }}="{{ attr.value }}"
                                </span>
                                <span v-if="node.text" class="xml-text mono">{{ node.text }}</span>
                                <span v-if="node.hasChildren && !normalizedQuery && collapsed[node.id]"
                                    class="xml-count">
                                    {{ node.childCount }} children
                                </span>
                            </div>
                        </div>

                        <div v-else class="xml-formatted">
                            <div class="xml-toolbar xml-toolbar-tight">
                                <button class="btn-secondary" @click="copyFormatted">
                                    {{ copied ? 'Copied' : 'Copy' }}
                                </button>
                            </div>
                            <pre class="xml-pre"><span v-for="(line, i) in formattedLines" :key="i" class="xml-line"
                                    :class="{ hit: line.hit }">{{ line.text }}
</span></pre>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<Request version="1.0">
  <Head>
    <MerchantID>YourMerchantID</MerchantID>
    <TransID>TX-000123</TransID>
  </Head>
  <Transaction type="SALE">
    <Amount currency="EUR">1000</Amount>
    <RefNr>REF-000123</RefNr>
    <Comment>Test order</Comment>
  </Transaction>
</Request>`

export default {
    name: 'XmlParserView',

    data() {
        return {
            source: '',
            query: '',
            doc: null,
            parsed: false,
            error: '',
            activeTab: 'tree',
            collapsed: {},
            nodes: [],
            copied: false,
            tabs: [
                { id: 'tree', label: 'Tree' },
                { id: 'formatted', label: 'Formatted' },
            ],
        }
    },

    computed: {
        formatted() {
            if (!this.doc) return ''
            const lines = []
            const declaration = this.source.match(/^\s*<\?xml[^>]*\?>/)
            if (declaration) lines.push(declaration[0].trim())
            for (const child of Array.from(this.doc.childNodes)) {
                this.serialize(child, 0, lines)
            }
            return lines.join('\n')
        },

        formattedLines() {
            const q = this.normalizedQuery
            return this.formatted.split('\n').map((text) => ({
                text,
                hit: !!q && text.toLowerCase().includes(q),
            }))
        },

        normalizedQuery() {
            return this.query.trim().toLowerCase()
        },

        // ids of elements whose tag, attributes, or own text contain the query
        matchedIds() {
            const q = this.normalizedQuery
            const ids = new Set()
            if (!q) return ids

            for (const node of this.nodes) {
                const haystack = [
                    node.name,
                    node.text,
                    ...node.attrs.map((a) => `${a.name}="${a.value}"`),
                ].join(' ').toLowerCase()
                if (haystack.includes(q)) ids.add(node.id)
            }
            return ids
        },

        matchCount() {
            return this.matchedIds.size
        },

        // matches plus their ancestor chain, so every hit keeps its path for context
        filteredIds() {
            const keep = new Set()
            const byId = this.nodes
            for (const id of this.matchedIds) {
                let current = byId[id]
                while (current) {
                    if (keep.has(current.id)) break
                    keep.add(current.id)
                    current = current.parentId === null ? null : byId[current.parentId]
                }
            }
            return keep
        },

        visibleNodes() {
            if (this.normalizedQuery) {
                return this.nodes.filter((node) => this.filteredIds.has(node.id))
            }

            const hidden = {}
            return this.nodes.filter((node) => {
                if (node.parentId !== null && (hidden[node.parentId] || this.collapsed[node.parentId])) {
                    hidden[node.id] = true
                    return false
                }
                return true
            })
        },

        stats() {
            let attributes = 0
            let depth = 0
            for (const node of this.nodes) {
                attributes += node.attrs.length
                if (node.depth + 1 > depth) depth = node.depth + 1
            }
            return {
                elements: this.nodes.length,
                attributes,
                depth,
                root: this.nodes.length ? this.nodes[0].name : '',
            }
        },
    },

    methods: {
        parse() {
            const text = this.source.trim()
            if (!text) return

            const doc = new DOMParser().parseFromString(text, 'application/xml')
            const failure = doc.querySelector('parsererror')

            if (failure) {
                this.error = failure.textContent.replace(/\s+/g, ' ').trim()
                this.doc = null
                this.parsed = false
                this.nodes = []
                return
            }

            this.error = ''
            this.doc = doc
            this.parsed = true
            this.collapsed = {}
            this.nodes = this.flatten(doc.documentElement)
        },

        onBlur() {
            // re-validate only once a result is already on screen, so typing is never interrupted
            if (this.parsed || this.error) this.parse()
        },

        flatten(root) {
            const nodes = []
            const walk = (element, depth, parentId) => {
                const children = Array.from(element.children)
                const id = nodes.length
                const ownText = Array.from(element.childNodes)
                    .filter((n) => n.nodeType === Node.TEXT_NODE || n.nodeType === Node.CDATA_SECTION_NODE)
                    .map((n) => n.nodeValue.trim())
                    .filter(Boolean)
                    .join(' ')

                nodes.push({
                    id,
                    depth,
                    parentId,
                    name: element.nodeName,
                    attrs: Array.from(element.attributes).map((a) => ({ name: a.name, value: a.value })),
                    text: ownText,
                    hasChildren: children.length > 0,
                    childCount: children.length,
                })

                for (const child of children) walk(child, depth + 1, id)
            }
            walk(root, 0, null)
            return nodes
        },

        serialize(node, depth, lines) {
            const pad = '  '.repeat(depth)

            if (node.nodeType === Node.COMMENT_NODE) {
                lines.push(`${pad}<!--${node.nodeValue}-->`)
                return
            }
            if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
                lines.push(`${pad}<?${node.target} ${node.data}?>`)
                return
            }
            if (node.nodeType === Node.CDATA_SECTION_NODE) {
                lines.push(`${pad}<![CDATA[${node.nodeValue}]]>`)
                return
            }
            if (node.nodeType === Node.TEXT_NODE) {
                const value = node.nodeValue.trim()
                if (value) lines.push(pad + this.escapeText(value))
                return
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return

            const attrs = Array.from(node.attributes)
                .map((a) => ` ${a.name}="${this.escapeAttr(a.value)}"`)
                .join('')

            const children = Array.from(node.childNodes).filter(
                (n) => n.nodeType !== Node.TEXT_NODE || n.nodeValue.trim()
            )

            if (!children.length) {
                lines.push(`${pad}<${node.nodeName}${attrs}/>`)
                return
            }

            const onlyText = children.length === 1 &&
                (children[0].nodeType === Node.TEXT_NODE || children[0].nodeType === Node.CDATA_SECTION_NODE)

            if (onlyText) {
                const inner = children[0].nodeType === Node.CDATA_SECTION_NODE
                    ? `<![CDATA[${children[0].nodeValue}]]>`
                    : this.escapeText(children[0].nodeValue.trim())
                lines.push(`${pad}<${node.nodeName}${attrs}>${inner}</${node.nodeName}>`)
                return
            }

            lines.push(`${pad}<${node.nodeName}${attrs}>`)
            for (const child of children) this.serialize(child, depth + 1, lines)
            lines.push(`${pad}</${node.nodeName}>`)
        },

        escapeText(value) {
            return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        },

        escapeAttr(value) {
            return this.escapeText(value).replace(/"/g, '&quot;')
        },

        toggle(id) {
            this.collapsed = { ...this.collapsed, [id]: !this.collapsed[id] }
        },

        expandAll() {
            this.collapsed = {}
        },

        collapseAll() {
            const next = {}
            for (const node of this.nodes) {
                if (node.hasChildren && node.depth > 0) next[node.id] = true
            }
            this.collapsed = next
        },

        applyFormatting() {
            this.source = this.formatted
            this.parse()
        },

        loadSample() {
            this.source = SAMPLE
            this.parse()
        },

        clearAll() {
            this.source = ''
            this.query = ''
            this.doc = null
            this.parsed = false
            this.error = ''
            this.nodes = []
            this.collapsed = {}
        },

        async copyFormatted() {
            try {
                await navigator.clipboard.writeText(this.formatted)
            } catch (e) {
                const ta = document.createElement('textarea')
                ta.value = this.formatted
                document.body.appendChild(ta)
                ta.select()
                document.execCommand('copy')
                document.body.removeChild(ta)
            }
            this.copied = true
            setTimeout(() => { this.copied = false }, 1500)
        },
    },
}
</script>

<style scoped>
.xml-wrapper {
    width: 100%;
    max-width: 1200px;
    margin: 20px auto;
    padding: 0 16px;
}

.xml-search {
    margin-bottom: 16px;
}

.xml-search-control {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
}

.xml-search-clear {
    padding: 8px 12px;
    border-radius: 6px;
    flex-shrink: 0;
}

.xml-search-hint {
    margin-top: 4px;
    font-size: 12px;
    color: #6a7e8c;
}

.xml-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
}

@media (min-width: 1024px) {
    .xml-layout {
        grid-template-columns: 1fr 1fr;
    }
}

.xml-input {
    height: 380px;
    resize: vertical;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    line-height: 1.5;
}

.xml-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
}

.xml-toolbar-tight {
    margin-top: 0;
    margin-bottom: 8px;
}

.xml-toolbar .btn-secondary {
    padding: 8px 12px;
    border-radius: 6px;
}

.xml-toolbar .btn-secondary:disabled {
    background-color: #c8d4dd;
    cursor: not-allowed;
}

.xml-toolbar .btn-primary {
    padding: 8px 20px;
    font-size: 13px;
}

.xml-result-title {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
}

.xml-tabs {
    display: flex;
    gap: 4px;
}

.xml-tab {
    border: 1px solid #dfe7ed;
    background: #ffffff;
    color: #496476;
    font-size: 12px;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
}

.xml-tab.active {
    background: #1e5582;
    border-color: #1e5582;
    color: #ffffff;
}

.xml-tab:focus-visible,
.xml-toggle:focus-visible {
    outline: 2px solid #1e5582;
    outline-offset: 2px;
}

.xml-error {
    background: #fff1f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 12px;
    font-size: 12px;
    color: #7f1d1d;
    line-height: 1.5;
}

.xml-empty {
    background: #ffffff;
    border: 1px dashed #dfe7ed;
    border-radius: 8px;
    padding: 24px 16px;
    text-align: center;
    font-size: 13px;
    color: #6a7e8c;
}

.xml-stats {
    font-size: 12px;
    color: #6a7e8c;
    margin-bottom: 10px;
}

.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.xml-tree {
    max-height: 420px;
    overflow: auto;
    background: #ffffff;
    border: 1px solid #e1e8ee;
    border-radius: 8px;
    padding: 10px;
}

.xml-node {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 6px;
    padding: 3px 0;
    font-size: 12px;
    line-height: 1.5;
}

.xml-toggle {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    border: 1px solid #dfe7ed;
    background: #f7f9fb;
    border-radius: 4px;
    color: #1e5582;
    font-size: 12px;
    line-height: 1;
    cursor: pointer;
}

.xml-toggle-spacer {
    width: 18px;
    flex-shrink: 0;
}

.xml-node.hit {
    background: #f3fbe3;
    border-left: 2px solid #a5f729;
    border-radius: 4px;
}

.xml-tag {
    color: #1e5582;
    font-weight: 600;
}

.xml-attr {
    color: #8a5a00;
    font-size: 11px;
}

.xml-text {
    color: #14532d;
    word-break: break-word;
}

.xml-count {
    font-size: 11px;
    color: #8a9aa6;
}

.xml-pre {
    background: #0b1020;
    color: #e5e7eb;
    padding: 12px;
    border-radius: 8px;
    font-size: 12px;
    line-height: 1.5;
    max-height: 420px;
    overflow: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.xml-line.hit {
    background: rgba(165, 247, 41, 0.22);
    color: #ffffff;
    border-radius: 2px;
}
</style>
