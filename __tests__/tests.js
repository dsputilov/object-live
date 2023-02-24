import ObservableObject from "../src/index.js";

it("addEventListener('change'), change leaf in tree object, subscribe by regexp", function () {
	let a = new ObservableObject({user: {name: 'foo'}});
	let checksum = '';
	a.addEventListener('change', /^user\.name$/, function (cfg) {
		checksum += '1';
	});
	a.data.user.name = 'bar';
	expect(checksum === '1' && a.data.user.name === 'bar').toBe(true);
});


it("addEventListener('change'), change leaf in tree object, subscribe by string path ", function () {
	let a = new ObservableObject({user: {name: 'foo'}});
	let checksum = '';
	a.addEventListener('change', "user.name", function (cfg) {
		checksum += '1';
	});
	a.data.user.name = 'bar';
	expect(checksum === '1' && a.data.user.name === 'bar').toBe(true);
});

it("addEventListener('change'), change root node in tree object", function () {
	let a = new ObservableObject({user: {name: 'foo'}});
	let checksum = '';
	a.addEventListener('change', /^user/, function (cfg) {
		checksum += '1';
	});
	a.data.user = {surname: 'bar'};
	expect(checksum === '1' && !a.data.user.name && a.data.user.surname === 'bar').toBe(true);
});

it("addEventListener('set'), add new property, catch property", function () {
	let a = new ObservableObject({user: {name: 'foo'}});
	let checksum = '';
	a.addEventListener('set', /^user\.balance/, function (cfg) {
		checksum += '1';
	});
	a.data.user.balance = 10;
	expect(checksum).toBe('1');
});

it("addEventListener('change'), add new property, change and catch subproperty", function () {
	let a = new ObservableObject({user: {name: 'foo'}});
	let checksum = '';
	a.addEventListener('change', /^user\.account\.balance/, function (cfg) {
		checksum += cfg.oldValue + '' + cfg.newValue;
	});
	a.data.user.account = {balance: 10};
	a.data.user.account.balance = 12;
	expect(checksum).toBe('1012');
});

it("addEventListener('set'), push value in array, catch new value", function () {
	let a = new ObservableObject({user: {names: ['foo']}});
	let checksum = '';
	a.addEventListener('set', /^user\.names\.1/, function (cfg) {
		checksum += cfg.newValue;
	});
	a.data.user.names.push('bar');
	expect(checksum).toBe('bar');
});

it.skip("addEventListener('set'), push value in array, catch changes of array length", function () {
	let a = new ObservableObject({user: {names: ['hello']}});
	let checksum = '';
	a.addEventListener('set', /^user\.names\.length/, function (cfg) {
		//console.log(cfg);
		checksum += cfg.oldValue + '' + cfg.newValue;
	});
	a.data.user.names.push('foo');
	a.data.user.names.push('bar');
	//console.log('checksum:', checksum);
	expect(checksum).toBe('1223');
});

it("create emptyObservableObject, addEventListener('change') and catch new value", function () {
	let a = new ObservableObject();
	let checksum = '';
	a.addEventListener('set', /^user/, function (cfg) {
		checksum += cfg.oldValue + '' + cfg.newValue;
	});
	a.data.user = 'Alisa';
	expect(checksum).toBe('undefinedAlisa');
});
