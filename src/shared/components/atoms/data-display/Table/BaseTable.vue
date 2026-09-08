<script setup>
defineProps({
  columns: { type: Array, required: true }, // [{ key, label }]
  rows: { type: Array, default: () => [] },
})
</script>

<template>
  <table class="base-table">
    <thead>
      <tr>
        <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in rows" :key="row.id ?? index">
        <td v-for="column in columns" :key="column.key">
          <slot :name="column.key" :row="row">{{ row[column.key] }}</slot>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.base-table {
  width: 100%;
  border-collapse: collapse;
}

.base-table th,
.base-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border, #e5e4e7);
  text-align: left;
}
</style>
