#!/usr/bin/env perl
use lib '../../../Scot-Internal-Modules/lib';
use lib '../lib';
use lib '../../lib';

use Test::More;
use Test::Mojo;
use Data::Dumper;
use Mojo::JSON qw(decode_json encode_json);

$ENV{'scot_mode'}           = "testing";
$ENV{'scot_auth_type'}      = "Testing";
$ENV{'scot_logfile'}        = "/var/log/scot/scot.test.log";
$ENV{'scot_config_paths'}   = '../../../Scot-Internal-Modules/etc';
$ENV{'scot_config_file'}    = '../../../Scot-Internal-Modules/etc/scot.test.cfg.pl';

print "Resetting test db...\n";
system("mongo scot-testing <../../install/src/mongodb/reset.js 2>&1 > /dev/null");

my $defgroups       = [ 'wg-scot-ir', 'testing' ];

my $t   = Test::Mojo->new('Scot');

my $body = '
    function test() {
        echo "foo"
    }
';

$t  ->post_ok  ('/scot/api/v2/signature'  => json => {
        name    => 'Test Sig 1',
        type    => 'testsig',
        body    => $body,
    })
    ->status_is(200)
    ->json_is('/status' => 'ok');

my $sig_id = $t->tx->res->json->{id};

 print Dumper($t->tx->res->json);
 done_testing();
 exit 0;



