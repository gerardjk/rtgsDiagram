// Force particle creation after everything loads
window.addEventListener('load', () => {
    console.log('Page fully loaded, attempting to create particles...');

    // Wait for animation to complete
    setTimeout(() => {
        console.log('Checking for createFlowParticles function...');

        if (typeof window.createFlowParticles === 'function') {
            console.log('Function found! Creating particles...');

            // Clear any existing
            if (typeof window.clearFlowParticles === 'function') {
                window.clearFlowParticles();
            }

            // Check if paths exist
            const paths = [
                'npp-to-fss-path',
                'npp-to-adi-line',
                'directentry-to-adi-line',
                'maroon-horizontal-branch',
                'becn-to-becs-line',
                'becg-to-becs-line'
            ];

            paths.forEach(pathId => {
                const path = document.getElementById(pathId);
                if (path) {
                    console.log(`Path ${pathId} exists:`, path);
                    if (path.getTotalLength) {
                        console.log(`Path ${pathId} length:`, path.getTotalLength());
                    }
                } else {
                    console.log(`Path ${pathId} NOT FOUND`);
                }
            });

            // Try to create particles on the main path
            const result = window.createFlowParticles('npp-to-fss-path', 6, {
                duration: 3000,
                size: 10  // Make them bigger
            });

            console.log('Particle creation result:', result);

            // Check if particles were actually created
            const particles = document.querySelectorAll('.flow-particle');
            console.log(`Found ${particles.length} particles in DOM`);

            if (particles.length > 0) {
                particles.forEach((p, i) => {
                    console.log(`Particle ${i}:`, {
                        cx: p.getAttribute('cx'),
                        cy: p.getAttribute('cy'),
                        r: p.getAttribute('r'),
                        fill: p.getAttribute('fill'),
                        opacity: p.getAttribute('opacity') || '1'
                    });
                });
            }
        } else {
            console.error('createFlowParticles function not found!');
        }
    }, 8000); // Wait for animation to complete
});