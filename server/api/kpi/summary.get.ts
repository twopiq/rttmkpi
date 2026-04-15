export default defineEventHandler(async () => {
  const surveySummary = await fetchSurveyKpiSummary()

  if (surveySummary) {
    return surveySummary
  }

  const sqliteSummary = fetchSurveySqliteKpiSummary()

  if (sqliteSummary) {
    return sqliteSummary
  }

  return {
    source: 'local-placeholder',
    updatedAt: new Date().toISOString(),
    stats: [
      {
        key: 'selected',
        label: 'Tanlangan ishlar',
        value: 0,
        description: 'API ulangandan keyin tanlangan oy natijalari chiqadi.',
      },
      {
        key: 'rating',
        label: "O'rtacha reyting",
        value: '0.0',
        description: 'SLA asosida 5 ballik baho.',
      },
      {
        key: 'complaints',
        label: 'Shikoyatlar',
        value: 0,
        description: 'Qaytarilgan yoki rad etilgan murojaatlar.',
      },
    ],
    employeeResults: [],
    indicators: [],
  }
})
