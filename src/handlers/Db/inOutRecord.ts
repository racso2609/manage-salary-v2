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
}

const InOutRecordHandler = new InOutRecordHandlerRepository();

export default InOutRecordHandler;
