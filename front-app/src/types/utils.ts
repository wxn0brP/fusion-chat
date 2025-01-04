export interface Utils_updater<T> {
    _value: T;
    get(): T;
    set(newValue: T): void;
}