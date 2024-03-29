import { expect, use }                                   from 'chai';
import stringsForChai                                    from 'chai-string';
import { useFakeTimers }                                 from 'sinon';
import { getCookie, hasCookie, setCookie, removeCookie } from '../src/crumble.js';

// - - - - - - - - - - - - - - - - - - - - - - - - - - - -

describe('crumble', function ()
{
	let clock;

	before(function ()
	{
		use(stringsForChai);
	});

	beforeEach(function ()
	{
		clock = useFakeTimers(344736000000);
	});

	afterEach(function ()
	{
		clock.restore();
	});

	describe('getCookie(plate, name)', function ()
	{
		it('returns the value of the cookie with a given name', function ()
		{
			// Act & Assert.
			expect(
				getCookie('one=three; two=one; three=two', 'one')
			).to.equal('three');

			// Act & Assert.
			expect(
				getCookie('one=three; two=one; three=two', 'two')
			).to.equal('one');

			// Act & Assert.
			expect(
				getCookie('one=three; two=one; three=two', 'three')
			).to.equal('two');
		});

		it('returns the value of the cookie with a given name that needs to be encoded', function ()
		{
			// Act & Assert.
			expect(
				getCookie('one=boring; %2C%3B%5C#$%25&+%3A%3C%3E%3D%2F%3F%40%5B%5D^%7B%7D`|%C3%A3%E2%82%AF%F0%A9%B8%BD%28%29!%22_=special; three=normal', ',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_')
			).to.equal('special');
		});

		it('returns the value of the cookie that is decoded in accordance to RFC 6265', function ()
		{
			// Act & Assert.
			expect(
				getCookie('one=boring; two=%2C%3B%5C#$%25&+:<>=/?@[]^{}`|%C3%A3%E2%82%AF%F0%A9%B8%BD()!%22_; three=boring', 'two')
			).to.equal(',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_');
		});

		it('returns an empty string when the cookie does not have a value', function ()
		{
			// Act & Assert.
			expect(
				getCookie('one=three; two=; three=two', 'two')
			).to.equal('');
		});

		it('returns `null` when a cookie does not exist', function ()
		{
			// Act & Assert.
			expect(
				getCookie('one=three; two=four; three=two', 'four')
			).to.equal(null);
		});
	});

	describe('hasCookie(plate, name)', function ()
	{
		it('returns `true` when the cookie exists with a given name', function ()
		{
			// Act & Assert.
			expect(
				hasCookie('one=three; two=one; three=two', 'one')
			).to.be.true;

			// Act & Assert.
			expect(
				hasCookie('one=three; two=one; three=two', 'two')
			).to.be.true;

			// Act & Assert.
			expect(
				hasCookie('one=three; two=one; three=two', 'three')
			).to.be.true;
		});

		it('returns `true` when the cookie exists with a given name that needs to be encoded', function ()
		{
			// Act & Assert.
			expect(
				hasCookie('one=boring; %2C%3B%5C#$%25&+%3A%3C%3E%3D%2F%3F%40%5B%5D^%7B%7D`|%C3%A3%E2%82%AF%F0%A9%B8%BD%28%29!%22_=special; three=normal', ',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_')
			).to.be.true;
		});

		it('returns `true` when the cookie does not have a value', function ()
		{
			// Act & Assert.
			expect(
				hasCookie('one=three; two=; three=two', 'two')
			).to.be.true;
		});

		it('returns `false` when a cookie does not exist', function ()
		{
			// Act & Assert.
			expect(
				hasCookie('one=three; two=four; three=two', 'four')
			).to.be.false;
		});
	});

	describe('setCookie(crumbs, value)', function ()
	{
		it('creates a cookie with the name specified by `crumbs.name` and a value specified by `value`', function ()
		{
			// Act
			let cookie = setCookie({
				name : 'name'
			}, 'value');

			// Assert.
			expect(cookie).to.startWith('name=value');
		});

		it('creates a cookie with the name encoded in accordance to RFC 6265', function ()
		{
			// Act
			let cookie = setCookie({
				name : ',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_'
			}, 'value');

			// Assert.
			expect(cookie).to.startWith('%2C%3B%5C#$%25&+%3A%3C%3E%3D%2F%3F%40%5B%5D^%7B%7D`|%C3%A3%E2%82%AF%F0%A9%B8%BD%28%29!%22_=value');
		});

		it('creates a cookie with the value specified by `crumbs.value` when `value` is not provided', function ()
		{
			// Act
			let cookie = setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			expect(cookie).to.startWith('name=value');
		});

		it('creates a cookie by ignoring `crumbs.value` when `value` is provided', function ()
		{
			// Act
			let cookie = setCookie({
				name : 'name', value : 'the value that should be ignored'
			}, 'value');

			// Assert.
			expect(cookie).to.startWith('name=value');
		});

		it('creates a cookie with the value encoded in accordance to RFC 6265', function ()
		{
			// Act.
			let cookieNotUsingValueCrumb = setCookie({
				name : 'name'
			}, ',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_');

			// Assert.
			expect(cookieNotUsingValueCrumb).to.startWith('name=%2C%3B%5C#$%25&+:<>=/?@[]^{}`|%C3%A3%E2%82%AF%F0%A9%B8%BD()!%22_');

			// Act.
			let cookieUsingValueCrumb = setCookie({
				name : 'name', value : ',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_'
			});

			// Assert.
			expect(cookieUsingValueCrumb).to.startWith('name=%2C%3B%5C#$%25&+:<>=/?@[]^{}`|%C3%A3%E2%82%AF%F0%A9%B8%BD()!%22_');
		});

		it('creates a cookie with no value when `value` or `crumbs.value` is `null`', function ()
		{
			// Act.
			let cookieUsingValue = setCookie({
				name : 'name'
			}, null);

			// Assert.
			expect(cookieUsingValue).to.startWith('name=');

			// Act.
			let cookieUsingValueCrumb = setCookie({
				name : 'name', value : null
			});

			// Assert.
			expect(cookieUsingValueCrumb).to.startWith('name=');
		});

		it('creates a cookie with no value when `value` and `crumbs.value` are not provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name'
			});

			// Assert.
			expect(cookie).to.startWith('name=');
		});

		it('creates a cookie that is only available on the path specified by `crumbs.path`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', path : '/a/document/path'
			});

			// Assert.
			expect(cookie).to.contain(';path=/a/document/path');
		});

		it('creates a cookie that is only available on the path of the current document when `crumbs.path` is not provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			expect(cookie).to.not.contain(';path=');
		});

		it('creates a cookie that is only available on the domain specified by `crumbs.domain`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', domain : 'sub.domain.com'
			});

			// Assert.
			expect(cookie).to.contain(';domain=sub.domain.com');
		});

		it('creates a cookie that is only available on the domain of the current document when `crumbs.domain` is not provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			expect(cookie).to.not.contain(';domain=');
		});

		it('creates a cookie that is only available over HTTPS when `crumbs.secure` is `true`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', secure : true
			});

			// Assert.
			expect(cookie).to.contain(';secure');
		});

		it('creates a cookie that is available over both HTTP and HTTPS when `crumbs.secure` is `false`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', secure : false
			});

			// Assert.
			expect(cookie).to.not.contain(';secure');
		});

		it('creates a cookie that is available over both HTTP and HTTPS when `crumbs.secure` is not provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			expect(cookie).to.not.contain(';secure');
		});

		it('creates a cookie that will expire after the number of milliseconds specified by `crumbs.age`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', age : 3600000
			});

			// Assert.
			expect(cookie).to.contain(';max-age=3600');

			// Assert.
			expect(cookie).to.contain(';expires=Thu, 04 Dec 1980 01:00:00 GMT');
		});

		it('creates a cookie that will expire at `23:59:59 on 31 Dec 9999` when `crumbs.age` is `Infinity`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', age : Infinity
			});

			// Assert.
			expect(cookie).to.contain(';max-age=253057564799');

			// Assert.
			expect(cookie).to.contain(';expires=Fri, 31 Dec 9999 23:59:59 GMT');
		});

		it('creates a cookie that will expire at the date specified by `crumbs.expires` as a date object', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', expires : new Date('Thu, 04 Dec 1980 02:00:00 GMT')
			});

			// Assert.
			expect(cookie).to.contain(';max-age=7200');

			// Assert.
			expect(cookie).to.contain(';expires=Thu, 04 Dec 1980 02:00:00 GMT');
		});

		it('creates a cookie that will expire at the date specified by `crumbs.expires` as a date string', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', expires : 'Thu, 04 Dec 1980 03:00:00 GMT'
			});

			// Assert.
			expect(cookie).to.contain(';max-age=10800');

			// Assert.
			expect(cookie).to.contain(';expires=Thu, 04 Dec 1980 03:00:00 GMT');
		});

		it('creates a cookie that will expire at the date specified by `crumbs.expires` as a timestamp', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', expires : 344750400000
			});

			// Assert.
			expect(cookie).to.contain(';max-age=14400');

			// Assert.
			expect(cookie).to.contain(';expires=Thu, 04 Dec 1980 04:00:00 GMT');
		});

		it('creates a cookie that will expire at `23:59:59 on 31 Dec 9999` when `crumbs.expires` is `Infinity`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', expires : Infinity
			});

			// Assert.
			expect(cookie).to.contain(';max-age=253057564799');

			// Assert.
			expect(cookie).to.contain(';expires=Fri, 31 Dec 9999 23:59:59 GMT');
		});

		it('creates a cookie that will expire at the end of the current session when both `crumbs.age` and `crumbs.expires` are not provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			expect(cookie).to.not.contain(';max-age=');

			// Assert.
			expect(cookie).to.not.contain(';expires=');
		});

		it('creates a cookie by ignoring `crumbs.expires` when `crumbs.age` is provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', age : 3600000, expires : new Date('Thu, 04 Dec 1980 05:00:00 GMT')
			});

			// Assert.
			expect(cookie).to.contain(';max-age=3600');

			// Assert.
			expect(cookie).to.contain(';expires=Thu, 04 Dec 1980 01:00:00 GMT');
		});

		it('creates a cookie with a SameSite policy specified by `crumbs.sameSite`', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value', sameSite : 'strict'
			});

			// Assert.
			expect(cookie).to.contain(';samesite=strict');
		});

		it('creates a cookie with a Lax SameSite policy when `crumbs.sameSite` is not provided', function ()
		{
			// Act.
			let cookie = setCookie({
				name : 'name', value : 'value'
			});

			// Assert.
			expect(cookie).to.contain(';samesite=lax');
		});

		it('throws a type error when `crumbs.name` is `null` or not provided', function ()
		{
			// Act & Assert.
			expect(function ()
			{
				setCookie({});

			}).to.throw(TypeError);

			// Act & Assert.
			expect(function ()
			{
				setCookie({
					name : null
				});

			}).to.throw(TypeError);
		});

		it('throws a type error when `crumbs.age` is not a valid number', function ()
		{
			// Act & Assert.
			expect(function ()
			{
				setCookie({
					name : 'name', value : 'value', age : 'not a number'
				});

			}).to.throw(TypeError);
		});

		it('throws a type error when `crumbs.expires` does not represent a valid date', function ()
		{
			// Act & Assert.
			expect(function ()
			{
				setCookie({
					name : 'name', value : 'value', expires : new Date('An invalid date string')
				});

			}).to.throw(TypeError);

			// Act & Assert.
			expect(function ()
			{
				setCookie({
					name : 'name', value : 'value', expires : 'An invalid date string'
				});

			}).to.throw(TypeError);
		});

		it('throws a type error when `crumbs.sameSite` is not `none`, `lax` or `strict`', function ()
		{
			// Act & Assert.
			expect(function ()
			{
				setCookie({
					name : 'name', value : 'value', sameSite : 'spy'
				});

			}).to.throw(TypeError);
		});

		it('throws an error when `crumbs.secure` is `false` and `crumbs.sameSite` is `none`', function ()
		{
			// Act & Assert.
			expect(function ()
			{
				setCookie({
					name : 'name', value : 'value', sameSite : 'none', secure : false
				});

			}).to.throw(Error);
		});
	});

	describe('removeCookie(crumbs)', function ()
	{
		it('removes a cookie with the name specified by `crumbs.name` by forcing it to immediately expire', function ()
		{
			// Act.
			let cookie = removeCookie({
				name : 'name'
			});

			// Assert.
			expect(cookie).to.startWith('name=');

			// Assert.
			expect(cookie).to.contain(';max-age=-3600');

			// Assert.
			expect(cookie).to.contain(';expires=Wed, 03 Dec 1980 23:00:00 GMT');
		});

		it('removes a cookie with the name encoded in accordance to RFC 6265', function ()
		{
			// Act
			let cookie = removeCookie({
				name : ',;\\#$%&+:<>=/?@[]^{}`|ã₯𩸽()!"_'
			});

			// Assert.
			expect(cookie).to.startWith('%2C%3B%5C#$%25&+%3A%3C%3E%3D%2F%3F%40%5B%5D^%7B%7D`|%C3%A3%E2%82%AF%F0%A9%B8%BD%28%29!%22_=');
		});

		it('removes a cookie from the path specified by `crumbs.path`', function ()
		{
			// Act.
			let cookie = removeCookie({
				name : 'name', path : '/a/document/path'
			});

			// Assert.
			expect(cookie).to.contain(';path=/a/document/path');
		});

		it('removes a cookie from the path of the current document when `crumbs.path` is not provided', function ()
		{
			// Act.
			let cookie = removeCookie({
				name : 'name'
			});

			// Assert.
			expect(cookie).to.not.contain(';path=');
		});

		it('removes a cookie from the the domain specified by `crumbs.domain`', function ()
		{
			// Act.
			let cookie = removeCookie({
				name : 'name', domain : 'co.uk'
			});

			// Assert.
			expect(cookie).to.contain(';domain=co.uk');
		});

		it('removes a cookie from the domain of the current document when `crumbs.domain` is not provided', function ()
		{
			// Act.
			let cookie = removeCookie({
				name : 'name'
			});

			// Assert.
			expect(cookie).to.not.contain(';domain=');
		});

		it('throws a type error when `crumbs.name` is `null` or not provided', function ()
		{
			// Act & Assert.
			expect(function ()
			{
				removeCookie({});

			}).to.throw(TypeError);

			// Act & Assert.
			expect(function ()
			{
				removeCookie({
					name : null
				});

			}).to.throw(TypeError);
		});
	});
});
