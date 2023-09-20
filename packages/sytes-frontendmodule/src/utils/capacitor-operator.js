import { buffer, filter, share, tap } from 'rxjs';

export function capacitor() {
    return capacitorInputObs => {
        const input = capacitorInputObs.pipe(
            // tap(data => console.log('input: ' + data)),
            share()
        );
        const bufferNotification = input.pipe(
            filter(data => data === null),
            // tap(() => console.log('bufferNotification'))
        );
        return input.pipe(
            filter(data => data !== null),
            // tap(data => console.log('add to buffer: ' + data)),
            buffer(bufferNotification),
            // tap(data => console.log('output: ' + data)),
        );
    };
}
