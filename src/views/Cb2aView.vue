<template>
    <Header />
    <div class="p-6 space-y-6">
        <h1 class="text-xl font-semibold">CB2A Use Case Explorer</h1>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Selector -->
            <div class="space-y-2">
                <label class="text-sm font-medium">Payment Use Case</label>
                <select v-model="selectedId" class="simple-dropdown">
                    <option v-for="u in useCases" :key="u.id" :value="u.id">
                        {{ u.label }}
                    </option>
                </select>

                <div class="text-sm text-gray-600">
                    <div><strong>CIT / MIT:</strong> {{ selected.citMit }}</div>
                    <div><strong>Acquisition:</strong> {{ selected.acquisition }}</div>
                    <div><strong>Description:</strong> {{ selected.description }}</div>
                </div>
            </div>

            <!-- CB2A Output -->
            <div class="md:col-span-2">
                <label class="text-sm font-medium">Generated CB2A Message</label>
                <pre class="mt-2 bg-gray-100 rounded p-4 text-xs overflow-auto whitespace-pre-wrap">
{{ cb2aMessage }}
        </pre>
            </div>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';

export default {
    name: 'CB2AUseCaseExplorer',

    data() {
        return {
            useCases: [
                {
                    id: 'single_cit_form',
                    label: 'Single Payment – CIT – Form',
                    paymentUseCase: 1,
                    citMit: 'CIT',
                    acquisition: 'Form',
                    description: 'One-off customer initiated payment',
                    cb2a: {
                        sf0028: 1,
                        sf0031: null,
                        sf0032: null,
                        sf0800: null,
                    },
                },
                {
                    id: 'shipment_cit_cof',
                    label: 'Shipment Payment – CIT – Card on File',
                    paymentUseCase: 4,
                    citMit: 'CIT',
                    acquisition: 'CoF',
                    description: 'Customer-initiated shipment payment using stored card',
                    cb2a: {
                        sf0028: 4,
                        sf0031: null,
                        sf0032: null,
                        sf0800: null,
                    },
                },
                {
                    id: 'shipment_mit_cof',
                    label: 'Shipment Payment – MIT – Card on File',
                    paymentUseCase: 4,
                    citMit: 'MIT',
                    acquisition: 'CoF',
                    description: 'Merchant-initiated shipment payment',
                    cb2a: {
                        sf0028: 4,
                        sf0031: null,
                        sf0032: null,
                        sf0800: null,
                    },
                },
                {
                    id: 'installment_initial',
                    label: 'Installment Payment – CIT – Initial',
                    paymentUseCase: 3,
                    citMit: 'CIT',
                    acquisition: 'Form',
                    description: 'Initial installment payment',
                    cb2a: {
                        sf0028: 3,
                        sf0031: 1,
                        sf0032: 3,
                        sf0800: 6,
                    },
                },
                {
                    id: 'installment_subseq',
                    label: 'Installment Payment – CIT – Subsequent',
                    paymentUseCase: 3,
                    citMit: 'CIT',
                    acquisition: 'CoF',
                    description: 'Subsequent installment payment',
                    cb2a: {
                        sf0028: 3,
                        sf0031: 2,
                        sf0032: 3,
                        sf0800: 7,
                    },
                },
            ],
            selectedId: 'single_cit_form',
        }
    },

    computed: {
        selected() {
            return this.useCases.find(u => u.id === this.selectedId)
        },

        cb2aMessage() {
            const u = this.selected
            const c = u.cb2a

            const posEntryMode = u.acquisition === 'Form' ? '0012' : '0010'
            const posCondition = u.citMit === 'CIT' ? '01' : '08'

            return `BMP 02 [Masked PAN]: 5000000000000001
BMP 03 [Processing Code]: 000000
BMP 04 [Amount]: 000000001000
BMP 07 [Transmission Date]: 0127152750
BMP 11 [STAN]: 027683
BMP 14 [Expiry]: 2804
BMP 22 [POS Entry Mode]: ${posEntryMode}
BMP 25 [POS Condition Code]: ${posCondition}

BMP 56 [National Data]
  SF 0028 [Payment use case]: ${c.sf0028}
${c.sf0031 !== null ? `  SF 0031 [Payment number]: ${c.sf0031}` : ''}
${c.sf0032 !== null ? `  SF 0032 [Total number of payments]: ${c.sf0032}` : ''}

BMP 59 [National Data]
${c.sf0800 !== null ? `  SF 0800 [Service Attribute]: ${c.sf0800}` : ''}`
        },
    },
    components: {
        Header
    }
}
</script>

<style scoped>
.simple-dropdown {
    border-radius: 5px;
    background-color: white;
    width: 100%;
    padding: 5px;
    border: 1px solid;
    border-color: #2e2e2e;
}
</style>
