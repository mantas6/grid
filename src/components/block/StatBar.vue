<template>
    <b-col cols="6" :class="`anim-${animation}`">
        <span class="text-center">{{ stat.name | startCase }}</span>
        <div class="small text-center text-secondary">{{ stat.current | formatShort }} / {{ stat.max | formatShort }}</div>
        <b-progress :value="stat.current" :max="stat.max" :variant="variant"></b-progress>
    </b-col>
</template>

<script>
import { startCase } from 'lodash'
import { timer } from 'rxjs';

export default {
    props: [ 'stat' ],

    data() {
        return {
            animation: undefined,
            animationTimer: undefined,
        };
    },

    filters: { startCase },

     computed: {
        variant() {
            const variants = {
                health: 'danger',
                energy: 'success',
            };

            return variants[this.stat.name];
        }
    },

    watch: {
        stat(now, before) {
            if (this.animationTimer) {
                this.animationTimer.unsubscribe();
                this.animationTimer = undefined;
            }

            if (now.current < before.current) {
                this.animation = 'decr';
            } else if (now.current > before.current) {
                this.animation = 'incr';
            } else {
                this.animation = undefined;
            }

            this.animationTimer = timer(1000).subscribe(() => {
                this.animation = undefined;
                this.animationTimer = undefined;
            });
        },
    },
}
</script>

<style lang="scss" scoped>
    .anim-incr {
        .progress {
            box-shadow: 0 0 10px 5px rgba(89, 181, 42, 0.35);
        }
    }
    .anim-decr {
        .progress {
            box-shadow: 0 0 10px 5px rgba(187, 38, 38, 0.35);
        }
    }
</style>
