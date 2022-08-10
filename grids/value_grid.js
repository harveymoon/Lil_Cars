// A grid of plant references. If not occupied, the value is null.
class ValueGrid extends Grid {
    constructor(width, height, defaultV) {
        super(width, height);
        this.fill(defaultV);
    }
}

