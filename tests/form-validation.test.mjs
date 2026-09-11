import assert from "node:assert/strict";
import test from "node:test";
import { getBirthDateError, getLoginErrors, getPhoneError, getRegistrationAccessErrors, normalizePhone } from "../app/lib/form-validation.ts";

test("login rejects blank fields and malformed email, accepts legacy passwords without changing them", () => {
  assert.ok(getLoginErrors("  ", "senha123").identifier);
  assert.ok(getLoginErrors("usuario", "      ").password);
  assert.ok(getLoginErrors("teste@", "senha123").identifier);
  assert.ok(getLoginErrors("usuario", "12345").password);
  assert.deepEqual(getLoginErrors(" usuario ", " 1234 "), { identifier: undefined, password: undefined });
  assert.ok(getLoginErrors("usuario", "x".repeat(129)).password);
});

test("birth date requires all parts, real calendar dates and a completed eighteenth birthday", () => {
  const today = new Date(2026, 8, 11);
  assert.ok(getBirthDateError("", "09", "2000", today));
  assert.ok(getBirthDateError("31", "02", "2000", today));
  assert.ok(getBirthDateError("29", "02", "2001", today));
  assert.equal(getBirthDateError("29", "02", "2000", today), undefined);
  assert.ok(getBirthDateError("12", "09", "2008", today));
  assert.equal(getBirthDateError("11", "09", "2008", today), undefined);
  assert.equal(getBirthDateError("10", "09", "2008", today), undefined);
});

test("phone accepts common formatting without accepting missing numbers or letters", () => {
  assert.equal(normalizePhone("+55 (11) 99999-9999"), "+5511999999999");
  assert.equal(getPhoneError("+55 (11) 99999-9999"), undefined);
  assert.equal(getPhoneError("(11) 99999-9999"), undefined);
  for (const value of ["", "   ", "123", "abc11999999999", "1".repeat(16)]) assert.ok(getPhoneError(value));
});

test("account creation checks every required access field and the existing password rules", () => {
  const valid = { username: "member.test", email: "test@example.com", accountPhone: "11999999999", password: "Senha123!" };
  assert.equal(Object.values(getRegistrationAccessErrors(valid)).some(Boolean), false);
  for (const field of Object.keys(valid)) assert.ok(getRegistrationAccessErrors({ ...valid, [field]: "" })[field]);
  for (const password of ["1234567", "senha123!", "SENHA123!", "Senhaaaa!", "Senha1234", "S1!".repeat(44)]) {
    assert.ok(getRegistrationAccessErrors({ ...valid, password }).password);
  }
});
