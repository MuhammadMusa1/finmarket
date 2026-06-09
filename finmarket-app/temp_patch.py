from pathlib import Path
root = Path.cwd()
schema = root / 'prisma' / 'schema.prisma'
text = schema.read_text('utf-8')
old = '''  priority      Int         @default(0)
  webhookUrl    String?
  routingEmail  String?
  webhookSecret String?
  contacts      BankContact[]'''
new = '''  priority      Int         @default(0)
  contacts      BankContact[]'''
if old in text:
    text = text.replace(old, new, 1)
    schema.write_text(text, encoding='utf-8')
    print('schema duplicate removed')
else:
    print('schema duplicate block not found')
seed = root / 'prisma' / 'seed.ts'
text = seed.read_text('utf-8')
old = 'name: "Банк эсхата", logoText: "ЭС", licenseNo: "0012", webhookUrl: "https://webhook.site/demo-eskhata", routingEmail: "leads@eskhata.tj"'
new = 'name: "ОАО «Банк Эсхата»", logoText: "ЭС", licenseNo: "0012", verified: true, status: "active", isPartner: true, priority: 100, webhookUrl: "https://webhook.site/demo-eskhata", routingEmail: "leads@eskhata.tj"'
if old in text:
    text = text.replace(old, new, 1)
    seed.write_text(text, encoding='utf-8')
    print('seed patched')
else:
    print('seed anchor not found')
