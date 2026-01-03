bun build back/app.ts \
  --target node \
  --outdir dist-back \
  --sourcemap \
  --external @wxn0brp/ac \
  --external @wxn0brp/db \
  --external @wxn0brp/falcon-frame \
  --external @wxn0brp/gloves-link-server \
  --external ajv \
  --external ajv-formats \
  --external cors \
  --external dotenv \
  --external firebase-admin \
  --external image-js \
  --external jose \
  --external multer \
  --external node-schedule \
  --external nodemailer \
  --external open-graph-scraper \
  --external sass \
  --external source-map-support \
  --external '#runtime/*'

bun build back/config-base/* --outdir ./dist-back/config-base