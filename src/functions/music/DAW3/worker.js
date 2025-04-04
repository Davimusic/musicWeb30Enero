// workers/drumScheduler.worker.js
self.onmessage = function(e) {
    const { pattern, BPM, subdivisions, currentTime } = e.data;
    const stepDuration = 60 / BPM / subdivisions;
    const schedule = [];
    const lookAhead = 0.2; // 200ms de anticipación
    
    const startStep = Math.floor(currentTime / stepDuration);
    const endStep = Math.floor((currentTime + lookAhead) / stepDuration);
  
    for (let step = startStep; step <= endStep; step++) {
      const stepIndex = step % pattern.steps.length;
      if (pattern.steps[stepIndex].activeSounds.length > 0) {
        schedule.push({
          time: step * stepDuration,
          sounds: pattern.steps[stepIndex].activeSounds
        });
      }
    }
    
    self.postMessage(schedule);
  };