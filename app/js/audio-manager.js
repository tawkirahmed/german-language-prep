export class AudioManager {
    constructor() {
        this.audioMap = new Map([
            ['am-bahnhof', { 
                file: 'am-bahnhof.mp3',
                situations: ['Bahnhof', 'Am Bahnhof', 'An der Haltestelle'],
                context: ['Zugverbindungen', 'Fahrkarten', 'Abfahrtszeiten']
            }],
            ['bahnhofsdurchsage', { 
                file: 'bahnhofsdurchsage.mp3',
                situations: ['Bahnhofsdurchsage', 'Durchsage am Bahnhof'],
                context: ['Gleis', 'Verspätung', 'Zugausfall']
            }],
            ['beim-einkaufen', { 
                file: 'beim-einkaufen.mp3',
                situations: ['Supermarkt', 'Im Supermarkt', 'Beim Einkaufen'],
                context: ['Preise', 'Produkte', 'Angebote']
            }],
            ['im-cafe', { 
                file: 'im-cafe.mp3',
                situations: ['Café', 'Im Café', 'Restaurant'],
                context: ['Bestellung', 'Getränke', 'Kuchen']
            }],
            ['restaurantreservierung', { 
                file: 'restaurantreservierung.mp3',
                situations: ['Restaurant', 'Reservierung'],
                context: ['Tischreservierung', 'Personenzahl', 'Uhrzeit']
            }],
            ['supermarktdurchsage', { 
                file: 'supermarktdurchsage.mp3',
                situations: ['Supermarktdurchsage', 'Durchsage im Supermarkt'],
                context: ['Sonderangebote', 'Aktionen', 'Öffnungszeiten']
            }],
            ['termin-vereinbaren', { 
                file: 'termin-vereinbaren.mp3',
                situations: ['Arztpraxis', 'Beim Arzt', 'Terminvereinbarung'],
                context: ['Termin', 'Uhrzeit', 'Datum']
            }],
            ['wettervorhersage', { 
                file: 'wettervorhersage.mp3',
                situations: ['Wettervorhersage', 'Wetterbericht'],
                context: ['Wetter', 'Temperatur', 'Regen']
            }]
        ]);

        this.currentAudio = null;
        this.playCount = 0;
        this.maxPlays = 2;
    }

    findAudioForSituation(situation) {
        for (const [id, info] of this.audioMap.entries()) {
            if (info.situations.some(s => s.toLowerCase() === situation.toLowerCase())) {
                return {
                    id,
                    filePath: `/audio/${info.file}`
                };
            }
        }
        return null;
    }

    findAudioForContext(context) {
        for (const [id, info] of this.audioMap.entries()) {
            if (info.context.some(c => context.toLowerCase().includes(c.toLowerCase()))) {
                return {
                    id,
                    filePath: `/audio/${info.file}`
                };
            }
        }
        return null;
    }

    async playAudio(audioId) {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }

        const audioInfo = this.audioMap.get(audioId);
        if (!audioInfo) {
            throw new Error('Audio not found');
        }

        if (this.playCount >= this.maxPlays) {
            throw new Error('Maximum plays reached for this audio');
        }

        this.currentAudio = new Audio(`/audio/${audioInfo.file}`);
        
        return new Promise((resolve, reject) => {
            this.currentAudio.addEventListener('ended', () => {
                this.playCount++;
                resolve();
            });

            this.currentAudio.addEventListener('error', (e) => {
                reject(new Error('Error playing audio: ' + e.message));
            });

            this.currentAudio.play().catch(reject);
        });
    }

    resetPlayCount() {
        this.playCount = 0;
    }

    stopAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }
    }

    getRemainingPlays() {
        return Math.max(0, this.maxPlays - this.playCount);
    }

    getCurrentPlayCount() {
        return this.playCount;
    }
}
