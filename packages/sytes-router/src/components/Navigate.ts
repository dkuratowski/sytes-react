
type Params = {
    to: string
};

export default function Navigate({ to }: Params) {
    console.log(`Navigate to '${to}')`);
    return null;
}
