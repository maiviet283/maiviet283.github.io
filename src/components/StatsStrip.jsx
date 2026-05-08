function StatsStrip({ text }) {
  return (
    <section className="stats-strip" aria-label={text.meta.keyNumbers}>
      {text.stats.map((item) => (
        <div className="stat-item reveal" key={item.value}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  )
}

export default StatsStrip
