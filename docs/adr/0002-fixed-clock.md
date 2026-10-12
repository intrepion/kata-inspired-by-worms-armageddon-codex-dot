# A deterministic engine owns the clock

Use fixed simulation ticks and a serializable seeded generator, independent from rendering. This makes pause, reload, projectile tests and bounded AI reproducible; frame-dependent physics was rejected because slow devices would change combat outcomes.
