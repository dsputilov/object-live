This library allows you to create tracked objects.
You can work with it as with a regular hash, while using subscriptions to the events of adding an element, changing and deleting


Usage:

Import library

    import State from "ObservableObject";

Create state machine

    const obj = new ObservableObject();

Now `obj` has observable property `data`, you can set any object to it

Example:

    obj.data = {
        animals: {
            cat: {name: 'Bob', age: 1},
            dog: {name: 'Alice', age: 2},
            monkey: {name: 'FooBar', age: 3}
        }
    };

And subscribe to some events.
For subscription, you can specify the path to the end property, 
Examples:

    obj.addEventListener('change', 'animals.cat.age', (res) => {
        console.log(res);   // res contains properties: oldValue, newValue;
    });
    obj.addEventListener('change', 'animals.dog.name', console.log);

or using the regexp as mask in path:

    obj.addEventListener('change', /^animals\.(.*)\.age/, console.log);  //subscribe to ages of cat, dog and monkey

when you change the `age` value, the `change` event will be fired:

    obj.data.animals.cat.age = 19;

You can set new property in object and get `set` event:

    obj.addEventListener('set', /.*/, res => {
        console.log(res);
    });
    obj.data.animals.cat.balance = '100$';

You can catch `delete` event:

    obj.addEventListener('delete', /^animals\.(.*)/, console.log);
    delete obj.data.animals.monkey;

It's easy to use and very fast, you can create objects containing 10k+ trackable properties and not worry about performance. Enjoy)