import { InOutRecord } from "@/types/InOut";
import InOutRecordSchema from "@/models/inOutRecords";
import { DbRepository } from ".";

class InOutRecordHandlerRepository extends DbRepository<InOutRecord> {
  constructor() {
    super(InOutRecordSchema);
  }

  create(data: InOutRecord) {
    return this.model.create(InOutRecord.parse(data));
  }

  createMany(data: InOutRecord[]) {
    const parsedData = data.map(d => InOutRecord.parse(d));
    return this.model.insertMany(parsedData);
  }
}

const InOutRecordHandler = new InOutRecordHandlerRepository();

export default InOutRecordHandler;
