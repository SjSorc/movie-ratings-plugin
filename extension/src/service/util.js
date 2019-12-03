export function reflect(promise) {
    return promise.then(
      (value) => {
        return { status: 'fulfilled', value};
      },
      (error) => {
        return { status: 'rejected', error };
      }
    );
}