// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class FundingToken extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save FundingToken entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save FundingToken entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("FundingToken", id.toString(), this);
  }

  static load(id: string): FundingToken | null {
    return store.get("FundingToken", id) as FundingToken | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get owner(): string {
    let value = this.get("owner");
    return value.toString();
  }

  set owner(value: string) {
    this.set("owner", Value.fromString(value));
  }

  get fundingvalue(): BigInt {
    let value = this.get("fundingvalue");
    return value.toBigInt();
  }

  set fundingvalue(value: BigInt) {
    this.set("fundingvalue", Value.fromBigInt(value));
  }

  get tenor(): BigInt {
    let value = this.get("tenor");
    return value.toBigInt();
  }

  set tenor(value: BigInt) {
    this.set("tenor", Value.fromBigInt(value));
  }
}
