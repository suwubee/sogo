#!/bin/bash

set -e

# This script only works with MySQL
# updates c_defaults and c_settings to longtext in the sogo_user_profile table
# to avoid truncation of data at 64k


defaultusername=$USER
defaulthostname=127.0.0.1
defaultdatabase=sogo
indextable=$(sogo-tool dump-defaults -f /etc/sogo/sogo.conf | awk -F\" '/ OCSFolderInfoURL =/  {print $2}' |  awk -F/ '{print $NF}')
if [ -z "$indextable" ]; then
  echo "Couldn't fetch OCSFolderInfoURL value, aborting" >&2
  exit 1
fi

read -p "Username ($defaultusername): " username
read -p "Hostname ($defaulthostname): " hostname
read -p "Database ($defaultdatabase): " database

if [ -z "$username" ]
then
  username=$defaultusername
fi

if [ -z "$hostname" ]
then
  hostname=$defaulthostname
fi

if [ -z "$database" ]
then
  database=$defaultdatabase
fi

sqlscript=""

function growUserProfile() {
    oldIFS="$IFS"
    IFS=" "
    part="`echo -e \"ALTER TABLE sogo_user_profile MODIFY c_defaults LONGTEXT;\\n\"`";
    sqlscript="$sqlscript$part"
    part="`echo -e \"ALTER TABLE sogo_user_profile MODIFY c_settings LONGTEXT;\\n\"`";
    sqlscript="$sqlscript$part"
    IFS="$oldIFS"
}

function growContactsQuick() {
    oldIFS="$IFS"
    IFS=" "
    part="`echo -e \"ALTER TABLE $table MODIFY c_mail text;\\n\"`";
    sqlscript="$sqlscript$part"
    IFS="$oldIFS"
}

echo "This script will ask for the database password twice" >&2
echo "Converting c_content from TEXT to LONGTEXT in the sogo_user_profile table" >&2
growUserProfile

echo "Converting c_mail from VARCHAR(255) to TEXT in Contacts quick tables" >&2
tables=`mysql -p -s -u $username -h $hostname $database -e "select SUBSTRING_INDEX(c_quick_location, '/', -1) from $indextable where c_path3 = 'Contacts';"`
for table in $tables;
do
  growContactsQuick
done

echo "$sqlscript" | mysql -p -s -u $username -h $hostname $database
