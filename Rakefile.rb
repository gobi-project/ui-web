require "rake"
require 'webrick'

desc "Compile sass to css"
task :sass do
  puts "Generate CSS from SCSS"
  `mkdir sass-compile`
  `cp -R bower_components/bootstrap-sass/vendor/assets/stylesheets/* sass-compile/`
  `cp -R sass/* sass-compile/`
  `sass sass-compile/gobi.css.scss css/gobi.css`
  `rm -R sass-compile`
end

desc "WEBrick Web Server"
task :web_server do
  server = WEBrick::HTTPServer.new :Port => 3000
  server.mount "/", WEBrick::HTTPServlet::FileHandler, './'
  trap('INT') { server.stop }
  server.start
end