from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from lxml import etree


DOCX = Path(__file__).resolve().parent / "Bao_Cao_Tieu_Luan_TMDT.docx"
W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
CP_NS = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
DC_NS = "http://purl.org/dc/elements/1.1/"


def xml_bytes(root):
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone="yes")


def main() -> None:
    with ZipFile(DOCX, "r") as archive:
        entries = {info.filename: archive.read(info.filename) for info in archive.infolist()}

    core = etree.fromstring(entries["docProps/core.xml"])
    for node in core.xpath(".//dc:creator", namespaces={"dc": DC_NS}):
        node.text = ""
    for node in core.xpath(".//cp:lastModifiedBy", namespaces={"cp": CP_NS}):
        node.text = ""
    entries["docProps/core.xml"] = xml_bytes(core)

    removed = 0
    for name, content in list(entries.items()):
        if not name.startswith("word/") or not name.endswith(".xml"):
            continue
        root = etree.fromstring(content)
        changed = False
        for element in root.iter():
            for attribute in list(element.attrib):
                if attribute.startswith(f"{{{W_NS}}}rsid"):
                    del element.attrib[attribute]
                    removed += 1
                    changed = True
        if changed:
            entries[name] = xml_bytes(root)

    entries.pop("docProps/custom.xml", None)
    with ZipFile(DOCX, "w", ZIP_DEFLATED) as archive:
        for name, content in entries.items():
            archive.writestr(name, content)
    print(f"Scrubbed metadata and removed {removed} rsid attributes")


if __name__ == "__main__":
    main()
